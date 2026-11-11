const { sequelize, assertTestDatabase, query } = require('./db');
const MariaDBSkillCategoryRepository = require('../../src/repositories/mariadb/MariaDBSkillCategoryRepository');
const MariaDBProjectRepository = require('../../src/repositories/mariadb/MariaDBProjectRepository');
const MariaDBMediaRepository = require('../../src/repositories/mariadb/MariaDBMediaRepository');
const SkillCategory = require('../../src/entities/SkillCategory');
const Project = require('../../src/entities/Project');

describe('Repository skill categories & projects (MariaDB tes)', () => {
  const categories = new MariaDBSkillCategoryRepository();
  const projects = new MariaDBProjectRepository();
  const media = new MariaDBMediaRepository();
  const PREFIX = '[it] ';
  let mediaId;

  const cleanup = async () => {
    await query('DELETE FROM projects WHERE title LIKE ?', [`${PREFIX}%`]);
    await query('DELETE FROM skill_categories WHERE name LIKE ?', [`${PREFIX}%`]);
    await query('DELETE FROM media WHERE object_key LIKE ?', ['it/%']);
  };

  beforeAll(async () => {
    await assertTestDatabase();
    await cleanup();
    await query(
      "INSERT INTO media (kind, object_key, mime, size_bytes) VALUES ('project_image', 'it/gambar.webp', 'image/webp', 1234)"
    );
    [{ id: mediaId }] = await query("SELECT id FROM media WHERE object_key = 'it/gambar.webp'");
  });

  afterAll(async () => {
    await cleanup();
    await sequelize.close();
  });

  it('kategori: create, findByName, update nama, reorder, delete', async () => {
    const a = await categories.create(new SkillCategory({ name: `${PREFIX}A`, sortOrder: 90 }));
    const b = await categories.create(new SkillCategory({ name: `${PREFIX}B`, sortOrder: 91 }));
    expect((await categories.findByName(`${PREFIX}A`)).id).toBe(a.id);

    const renamed = await categories.update(a.id, new SkillCategory({ ...a, name: `${PREFIX}A2` }));
    expect(renamed.name).toBe(`${PREFIX}A2`);

    await categories.reorder([b.id, a.id]);
    expect((await categories.findById(b.id)).sortOrder).toBe(1);
    expect((await categories.findById(a.id)).sortOrder).toBe(2);

    await categories.delete(a.id);
    expect(await categories.findById(a.id)).toBeNull();
  });

  it('kategori: nama duplikat ditolak database', async () => {
    await categories.create(new SkillCategory({ name: `${PREFIX}Dup` }));
    await expect(categories.create(new SkillCategory({ name: `${PREFIX}Dup` }))).rejects.toThrow();
  });

  it('project: menyimpan boolean dan referensi media, lalu membacanya kembali', async () => {
    const created = await projects.create(
      new Project({
        title: `${PREFIX}Terbit`,
        description: 'x',
        imageMediaId: mediaId,
        linkUrl: 'https://x.dev',
      })
    );
    expect(created).toEqual(
      expect.objectContaining({
        imageMediaId: mediaId,
        showButton: true,
        isPublished: true,
        sortOrder: 0,
      })
    );
    expect((await media.findById(mediaId)).objectKey).toBe('it/gambar.webp');
  });

  it('project: findAll mengurutkan sort_order ASC lalu terbaru dulu, dengan paginasi', async () => {
    const draft = (title, sortOrder) =>
      projects.create(
        new Project({ title: `${PREFIX}${title}`, description: 'x', isPublished: false, sortOrder })
      );
    await draft('Urut-2', -2);
    await draft('Urut-1-lama', -3);
    await draft('Urut-1-baru', -3);

    const { data, meta } = await projects.findAll({ page: 1, limit: 3 });

    expect(data.map((p) => p.title)).toEqual([
      `${PREFIX}Urut-1-baru`,
      `${PREFIX}Urut-1-lama`,
      `${PREFIX}Urut-2`,
    ]);
    expect(meta).toEqual(expect.objectContaining({ page: 1, limit: 3 }));
    expect(meta.total).toBeGreaterThanOrEqual(3);
  });

  it('project: reorder dan findAllIds', async () => {
    const one = await projects.create(
      new Project({ title: `${PREFIX}R1`, description: 'x', isPublished: false })
    );
    const two = await projects.create(
      new Project({ title: `${PREFIX}R2`, description: 'x', isPublished: false })
    );

    await projects.reorder([two.id, one.id]);

    expect((await projects.findById(two.id)).sortOrder).toBe(1);
    expect((await projects.findById(one.id)).sortOrder).toBe(2);
    expect(await projects.findAllIds()).toEqual(expect.arrayContaining([one.id, two.id]));
  });

  it('project: menghapus media mengosongkan image_media_id (ON DELETE SET NULL)', async () => {
    await query(
      "INSERT INTO media (kind, object_key, mime, size_bytes) VALUES ('project_image', 'it/hapus.webp', 'image/webp', 1)"
    );
    const [{ id }] = await query("SELECT id FROM media WHERE object_key = 'it/hapus.webp'");
    const created = await projects.create(
      new Project({ title: `${PREFIX}SetNull`, description: 'x', imageMediaId: id })
    );

    await query('DELETE FROM media WHERE id = ?', [id]);

    expect((await projects.findById(created.id)).imageMediaId).toBeNull();
  });
});
