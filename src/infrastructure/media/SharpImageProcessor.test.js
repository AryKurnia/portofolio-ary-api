const zlib = require('node:zlib');
const sharp = require('sharp');
const SharpImageProcessor = require('./SharpImageProcessor');
const UnsupportedMediaTypeError = require('../../exceptions/UnsupportedMediaTypeError');
const ValidationError = require('../../exceptions/ValidationError');

// Fixture dibuat dengan sharp sungguhan (tanpa mock).
const image = (width, height, format = 'png') =>
  sharp({ create: { width, height, channels: 3, background: '#336699' } })
    [format]()
    .toBuffer();

describe('SharpImageProcessor', () => {
  const processor = new SharpImageProcessor();

  it('gambar project: WebP 400/800/1200 dari gambar besar, ukuran asli dilaporkan', async () => {
    // ACT
    const result = await processor.process({
      buffer: await image(1600, 900, 'jpeg'),
      kind: 'project_image',
    });

    // ASSERT
    expect(result).toEqual(
      expect.objectContaining({ mime: 'image/webp', width: 1600, height: 900 })
    );
    expect(result.variants.map((v) => v.name)).toEqual(['400', '800', '1200']);
    const widths = await Promise.all(
      result.variants.map(async (v) => (await sharp(v.buffer).metadata()).width)
    );
    expect(widths).toEqual([400, 800, 1200]);
    expect((await sharp(result.variants[0].buffer).metadata()).format).toBe('webp');
  });

  it('tidak memperbesar gambar kecil (withoutEnlargement)', async () => {
    const result = await processor.process({
      buffer: await image(300, 200),
      kind: 'project_image',
    });
    const widths = await Promise.all(
      result.variants.map(async (v) => (await sharp(v.buffer).metadata()).width)
    );
    expect(widths).toEqual([300, 300, 300]);
  });

  it('logo skill: WebP 128/256', async () => {
    const result = await processor.process({
      buffer: await image(512, 512, 'webp'),
      kind: 'skill_logo',
    });
    expect(result.variants.map((v) => v.name)).toEqual(['128', '256']);
  });

  it('menerapkan orientasi EXIF dan membuang metadata', async () => {
    // ARRANGE — JPEG 400x200 dengan EXIF orientation 6 (diputar 90°)
    const rotated = await sharp(await image(400, 200, 'jpeg'))
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer();

    // ACT
    const result = await processor.process({ buffer: rotated, kind: 'profile_photo' });

    // ASSERT
    expect([result.width, result.height]).toEqual([200, 400]);
    const output = await sharp(result.variants[0].buffer).metadata();
    expect(output.exif).toBeUndefined();
    expect(output.orientation).toBeUndefined();
  });

  it('logo SVG disanitasi dan disimpan apa adanya (tetap vektor)', async () => {
    const input = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="32"><script>x</script><rect width="64" height="32"/></svg>'
    );
    const result = await processor.process({ buffer: input, kind: 'skill_logo' });
    expect(result).toEqual(
      expect.objectContaining({ mime: 'image/svg+xml', width: 64, height: 32 })
    );
    expect(result.variants).toHaveLength(1);
    expect(result.variants[0].buffer.toString()).not.toContain('script');
  });

  it.each([
    ['href', 'href'],
    ['xlink:href', 'xlink:href'],
  ])(
    'menolak SVG yang hanya membungkus bitmap (%s="data:image/...") dengan pesan jelas',
    async (_label, attr) => {
      // ARRANGE — pola ekspor Figma untuk logo raster
      const png = (await image(4, 4)).toString('base64');
      const input = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 4 4"><image width="4" height="4" ${attr}="data:image/png;base64,${png}"/></svg>`
      );

      // ACT
      const error = await processor.process({ buffer: input, kind: 'skill_logo' }).catch((e) => e);

      // ASSERT
      expect(error).toBeInstanceOf(UnsupportedMediaTypeError);
      expect(error.message).toMatch(/embedded bitmap/);
    }
  );

  it.each(['project_image', 'profile_photo'])('menolak SVG untuk %s', async (kind) => {
    const input = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>');
    await expect(processor.process({ buffer: input, kind })).rejects.toThrow(
      UnsupportedMediaTypeError
    );
  });

  it.each([
    [
      'GIF',
      async () =>
        sharp({ create: { width: 4, height: 4, channels: 3, background: 'red' } })
          .gif()
          .toBuffer(),
    ],
    ['teks yang menyamar jadi .png', async () => Buffer.from('ini bukan gambar')],
    ['HTML', async () => Buffer.from('<html><script>alert(1)</script></html>')],
  ])('menolak %s berdasarkan isi file', async (_label, makeBuffer) => {
    await expect(
      processor.process({ buffer: await makeBuffer(), kind: 'project_image' })
    ).rejects.toThrow(UnsupportedMediaTypeError);
  });

  it('menolak gambar raksasa (header 7000x7000) sebelum didekode', async () => {
    // ARRANGE — PNG 10x10 yang header IHDR-nya diubah menjadi 7000x7000 (CRC dihitung ulang)
    const png = Buffer.from(await image(10, 10));
    png.writeUInt32BE(7000, 16);
    png.writeUInt32BE(7000, 20);
    png.writeUInt32BE(zlib.crc32(png.subarray(12, 29)) >>> 0, 29);

    // ACT
    const error = await processor.process({ buffer: png, kind: 'project_image' }).catch((e) => e);

    // ASSERT
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.details[0].field).toBe('file');
  });

  describe('file sertifikat', () => {
    const pdf = Buffer.from('%PDF-1.7\n1 0 obj << >> endobj\ntrailer << >>\n%%EOF\n', 'latin1');

    it('PDF disimpan apa adanya dengan Content-Disposition inline', async () => {
      const result = await processor.process({ buffer: pdf, kind: 'certificate_file' });
      expect(result).toEqual({
        mime: 'application/pdf',
        width: null,
        height: null,
        variants: [
          {
            name: 'original',
            buffer: pdf,
            contentType: 'application/pdf',
            extension: 'pdf',
            contentDisposition: 'inline',
          },
        ],
      });
    });

    it('gambar sertifikat dikonversi ke WebP 800/1600', async () => {
      const result = await processor.process({
        buffer: await image(2000, 1400, 'jpeg'),
        kind: 'certificate_file',
      });
      expect(result.mime).toBe('image/webp');
      expect(result.variants.map((v) => v.name)).toEqual(['800', '1600']);
    });

    it('menolak PDF terpotong (tanpa penanda %%EOF)', async () => {
      const truncated = pdf.subarray(0, 20);
      await expect(
        processor.process({ buffer: truncated, kind: 'certificate_file' })
      ).rejects.toThrow('The PDF file is invalid or incomplete.');
    });

    it.each(['project_image', 'skill_logo', 'profile_photo'])(
      'menolak PDF untuk kind %s',
      async (kind) => {
        await expect(processor.process({ buffer: pdf, kind })).rejects.toThrow(
          UnsupportedMediaTypeError
        );
      }
    );

    it('menolak SVG untuk sertifikat dengan daftar format yang benar', async () => {
      const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>');
      await expect(processor.process({ buffer: svg, kind: 'certificate_file' })).rejects.toThrow(
        UnsupportedMediaTypeError
      );
    });

    it('menolak file selain PDF/gambar dengan pesan format sertifikat', async () => {
      await expect(
        processor.process({ buffer: Buffer.from('hello'), kind: 'certificate_file' })
      ).rejects.toThrow('Use PDF, PNG, JPG or WebP.');
    });
  });
});
