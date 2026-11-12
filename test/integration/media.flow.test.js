// Upload gambar ujung-ke-ujung: sharp + DOMPurify + MinIO + MariaDB tes sungguhan (tanpa mock).
// Semua objek ditulis di prefix `it-test/` dan dihapus lagi di akhir tes.
const sharp = require('sharp');
const { sequelize, assertTestDatabase, query } = require('./db');
const config = require('../../src/config');
const minioClient = require('../../src/infrastructure/storage/minioClient');
const MinioFileStorage = require('../../src/infrastructure/storage/MinioFileStorage');
const SharpImageProcessor = require('../../src/infrastructure/media/SharpImageProcessor');
const MariaDBMediaRepository = require('../../src/repositories/mariadb/MariaDBMediaRepository');
const UploadMedia = require('../../src/use-cases/media/UploadMedia');
const DeleteMedia = require('../../src/use-cases/media/DeleteMedia');
const CleanupOrphanMedia = require('../../src/use-cases/media/CleanupOrphanMedia');
const ConflictError = require('../../src/exceptions/ConflictError');

const KEY_PREFIX = 'it-test/';

describe('Alur media (MinIO + MariaDB tes)', () => {
  const fileStorage = new MinioFileStorage(
    minioClient,
    config.minio.bucket,
    config.minio.publicUrl
  );
  const mediaRepository = new MariaDBMediaRepository();
  const logger = { warn: jest.fn() };
  const deps = { mediaRepository, fileStorage, logger };
  const uploadMedia = new UploadMedia({
    ...deps,
    imageProcessor: new SharpImageProcessor(),
    keyPrefix: KEY_PREFIX,
  });

  const objectExists = (key) =>
    minioClient.statObject(config.minio.bucket, key).then(
      (stat) => stat,
      () => null
    );

  const removeTestData = async () => {
    const keys = [];
    for await (const item of minioClient.listObjectsV2(config.minio.bucket, KEY_PREFIX, true))
      keys.push(item.name);
    if (keys.length) await minioClient.removeObjects(config.minio.bucket, keys);
    await query("UPDATE projects SET image_media_id = NULL WHERE title LIKE '[it-media]%'");
    await query("DELETE FROM projects WHERE title LIKE '[it-media]%'");
    await query("DELETE FROM certificates WHERE name LIKE '[it-media]%'");
    await query('DELETE FROM media WHERE object_key LIKE ?', [`${KEY_PREFIX}%`]);
  };

  beforeAll(async () => {
    await assertTestDatabase();
    const reachable = await minioClient.bucketExists(config.minio.bucket).catch((error) => error);
    if (reachable !== true) {
      throw new Error(
        `MinIO/bucket tidak bisa dijangkau untuk tes integrasi: ${reachable?.code ?? reachable}`
      );
    }
    await removeTestData();
  });

  afterAll(async () => {
    await removeTestData();
    await sequelize.close();
  });

  it('gambar project: varian WebP tersimpan dengan Content-Type & Cache-Control immutable, data di DB', async () => {
    // ARRANGE
    const png = await sharp({
      create: { width: 1000, height: 500, channels: 3, background: '#123456' },
    })
      .png()
      .toBuffer();

    // ACT
    const media = await uploadMedia.execute({ kind: 'project_image', buffer: png });

    // ASSERT
    expect(Object.keys(media.variants)).toEqual(['400', '800', '1200']);
    expect(media.objectKey).toMatch(/^it-test\/project_image\/[0-9a-f-]{36}-1200\.webp$/);
    for (const key of Object.values(media.variants)) {
      const stat = await objectExists(key);
      expect(stat.metaData['content-type']).toBe('image/webp');
      expect(stat.metaData['cache-control']).toBe('public, max-age=31536000, immutable');
    }
    const [row] = await query('SELECT kind, mime, width, height FROM media WHERE id = ?', [
      media.id,
    ]);
    expect(row).toEqual({ kind: 'project_image', mime: 'image/webp', width: 1000, height: 500 });
  });

  it('URL publik bisa diakses tanpa kredensial (kebijakan bucket mengizinkan baca anonim)', async () => {
    const png = await sharp({
      create: { width: 200, height: 200, channels: 3, background: '#000' },
    })
      .png()
      .toBuffer();
    const media = await uploadMedia.execute({ kind: 'skill_logo', buffer: png });

    const response = await fetch(fileStorage.getPublicUrl(media.objectKey));

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/webp');
  });

  it('logo SVG tersimpan dalam keadaan sudah disanitasi', async () => {
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><script>alert(1)</script><rect width="10" height="10" onclick="x()"/></svg>'
    );
    const media = await uploadMedia.execute({ kind: 'skill_logo', buffer: svg });

    const stream = await minioClient.getObject(config.minio.bucket, media.objectKey);
    const stored = (await require('node:stream/consumers').buffer(stream)).toString();
    expect(media.mime).toBe('image/svg+xml');
    expect(stored).not.toMatch(/script|onclick/);
    expect(stored).toContain('<rect');
  });

  it('PDF sertifikat: disimpan apa adanya, disajikan inline + immutable, bisa dibaca anonim', async () => {
    // ARRANGE
    const pdf = Buffer.from(
      '%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n',
      'latin1'
    );

    // ACT
    const media = await uploadMedia.execute({ kind: 'certificate_file', buffer: pdf });

    // ASSERT
    expect(media.objectKey).toMatch(/^it-test\/certificate_file\/[0-9a-f-]{36}\.pdf$/);
    expect(media.variants).toEqual({ original: media.objectKey });
    const response = await fetch(fileStorage.getPublicUrl(media.objectKey));
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');
    expect(response.headers.get('content-disposition')).toBe('inline');
    expect(response.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
    expect(Buffer.from(await response.arrayBuffer())).toEqual(pdf);
    const [row] = await query('SELECT kind, mime, size_bytes, width FROM media WHERE id = ?', [
      media.id,
    ]);
    expect(row).toEqual({
      kind: 'certificate_file',
      mime: 'application/pdf',
      size_bytes: pdf.length,
      width: null,
    });
  });

  it('file yang dipakai sertifikat tidak bisa dihapus (409)', async () => {
    const pdf = Buffer.from('%PDF-1.4\n%%EOF\n', 'latin1');
    const media = await uploadMedia.execute({ kind: 'certificate_file', buffer: pdf });
    await query(
      "INSERT INTO certificates (name, issuer, issued_at, file_media_id) VALUES ('[it-media] C', 'x', '2025-03-01', ?)",
      [media.id]
    );
    await expect(new DeleteMedia(deps).execute(media.id)).rejects.toThrow(ConflictError);
    expect(await mediaRepository.isReferenced(media.id)).toBe(true);
  });

  it('media yang dipakai project tidak bisa dihapus; setelah dilepas, data & objek terhapus', async () => {
    // ARRANGE
    const png = await sharp({
      create: { width: 100, height: 100, channels: 3, background: '#fff' },
    })
      .png()
      .toBuffer();
    const media = await uploadMedia.execute({ kind: 'project_image', buffer: png });
    await query(
      "INSERT INTO projects (title, description, image_media_id, show_button, is_published) VALUES ('[it-media] P', 'x', ?, 0, 1)",
      [media.id]
    );
    const deleteMedia = new DeleteMedia(deps);

    // ACT + ASSERT — masih dipakai
    await expect(deleteMedia.execute(media.id)).rejects.toThrow(ConflictError);

    // ACT + ASSERT — setelah dilepas
    await query("UPDATE projects SET image_media_id = NULL WHERE title = '[it-media] P'");
    await deleteMedia.execute(media.id);
    expect(await mediaRepository.findById(media.id)).toBeNull();
    for (const key of Object.values(media.variants)) expect(await objectExists(key)).toBeNull();
  });

  it('cleanup menghapus upload yatim yang lebih tua dari batas umur, bukan yang baru', async () => {
    // ARRANGE
    const png = await sharp({ create: { width: 50, height: 50, channels: 3, background: '#f00' } })
      .png()
      .toBuffer();
    const oldOrphan = await uploadMedia.execute({ kind: 'profile_photo', buffer: png });
    const freshOrphan = await uploadMedia.execute({ kind: 'profile_photo', buffer: png });
    await query('UPDATE media SET created_at = NOW() - INTERVAL 2 DAY WHERE id = ?', [
      oldOrphan.id,
    ]);

    // ACT
    await new CleanupOrphanMedia(deps).execute({ minAgeHours: 24 });

    // ASSERT
    expect(await mediaRepository.findById(oldOrphan.id)).toBeNull();
    expect(await objectExists(oldOrphan.objectKey)).toBeNull();
    expect(await mediaRepository.findById(freshOrphan.id)).not.toBeNull();
  });
});
