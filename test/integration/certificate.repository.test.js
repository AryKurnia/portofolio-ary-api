const { sequelize, assertTestDatabase, query } = require('./db');
const MariaDBCertificateRepository = require('../../src/repositories/mariadb/MariaDBCertificateRepository');
const MariaDBMediaRepository = require('../../src/repositories/mariadb/MariaDBMediaRepository');
const Certificate = require('../../src/entities/Certificate');

describe('Repository certificates (MariaDB tes)', () => {
  const certificates = new MariaDBCertificateRepository();
  const media = new MariaDBMediaRepository();
  const PREFIX = '[it-cert] ';
  let fileId;

  const cleanup = async () => {
    await query('DELETE FROM certificates WHERE name LIKE ?', [`${PREFIX}%`]);
    await query("DELETE FROM media WHERE object_key LIKE 'it-cert/%'");
  };

  beforeAll(async () => {
    await assertTestDatabase();
    await cleanup();
    await query(
      "INSERT INTO media (kind, object_key, mime, size_bytes, variants) VALUES ('certificate_file', 'it-cert/a.pdf', 'application/pdf', 99, JSON_OBJECT('original', 'it-cert/a.pdf'))"
    );
    [{ id: fileId }] = await query("SELECT id FROM media WHERE object_key = 'it-cert/a.pdf'");
  });

  afterAll(async () => {
    await cleanup();
    await sequelize.close();
  });

  it('menyimpan & membaca kembali: tanggal YYYY-MM, file beserta data media', async () => {
    const created = await certificates.create(
      new Certificate({
        name: `${PREFIX}CKA`,
        issuer: 'CNCF',
        issuedAt: '2025-03',
        expiresAt: '2028-03',
        credentialId: 'ABC-1',
        credentialUrl: 'https://verify.example/1',
        fileMediaId: fileId,
        isPublished: true,
        sortOrder: 1,
      })
    );
    expect(created).toEqual(
      expect.objectContaining({
        issuedAt: '2025-03',
        expiresAt: '2028-03',
        fileMediaId: fileId,
        isPublished: true,
      })
    );
    expect(created.file).toEqual(
      expect.objectContaining({ mime: 'application/pdf', sizeBytes: 99, width: null })
    );
    expect(await media.isReferenced(fileId)).toBe(true);
  });

  it('default draf; findAll urut sort_order, publishedOnly hanya yang terbit', async () => {
    const draft = await certificates.create(
      new Certificate({ name: `${PREFIX}Draft`, issuer: 'X', issuedAt: '2024-01', sortOrder: 2 })
    );
    expect(draft).toEqual(
      expect.objectContaining({ isPublished: false, expiresAt: null, file: null })
    );

    const all = (await certificates.findAll()).filter((c) => c.name.startsWith(PREFIX));
    expect(all.map((c) => c.name)).toEqual([`${PREFIX}CKA`, `${PREFIX}Draft`]);
    const published = (await certificates.findAll({ publishedOnly: true })).filter((c) =>
      c.name.startsWith(PREFIX)
    );
    expect(published.map((c) => c.name)).toEqual([`${PREFIX}CKA`]);
  });

  it('update, reorder, delete', async () => {
    const [first, second] = (await certificates.findAll()).filter((c) => c.name.startsWith(PREFIX));
    const updated = await certificates.update(
      second.id,
      new Certificate({ ...second, expiresAt: '2026-01' })
    );
    expect(updated.expiresAt).toBe('2026-01');

    await certificates.reorder([second.id, first.id]);
    expect((await certificates.findById(second.id)).sortOrder).toBe(1);
    expect((await certificates.findById(first.id)).sortOrder).toBe(2);

    await certificates.delete(second.id);
    expect(await certificates.findById(second.id)).toBeNull();
  });

  it('CHECK: kedaluwarsa sebelum tanggal terbit ditolak database', async () => {
    await expect(
      query(
        "INSERT INTO certificates (name, issuer, issued_at, expires_at) VALUES (?, 'X', '2025-03-01', '2025-02-01')",
        [`${PREFIX}Bad`]
      )
    ).rejects.toThrow(/chk_certificates_period_order/);
  });

  it('media sertifikat yang tidak dirujuk ikut terdeteksi sebagai yatim', async () => {
    await query('UPDATE certificates SET file_media_id = NULL WHERE name LIKE ?', [`${PREFIX}%`]);
    expect(await media.isReferenced(fileId)).toBe(false);
    const orphans = await media.findOrphans(new Date(Date.now() + 60_000));
    expect(orphans.map((m) => m.id)).toContain(fileId);
  });
});
