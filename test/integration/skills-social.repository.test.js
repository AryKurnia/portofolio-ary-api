const { sequelize, assertTestDatabase, query } = require('./db');
const MariaDBSkillRepository = require('../../src/repositories/mariadb/MariaDBSkillRepository');
const MariaDBSocialLinkRepository = require('../../src/repositories/mariadb/MariaDBSocialLinkRepository');
const MariaDBMediaRepository = require('../../src/repositories/mariadb/MariaDBMediaRepository');
const Skill = require('../../src/entities/Skill');
const SocialLink = require('../../src/entities/SocialLink');

describe('Repository skills & social links (MariaDB tes)', () => {
  const skills = new MariaDBSkillRepository();
  const links = new MariaDBSocialLinkRepository();
  const media = new MariaDBMediaRepository();
  const PREFIX = '[it-skill] ';
  let catA;
  let catB;
  let logoId;

  const cleanup = async () => {
    await query('DELETE FROM skills WHERE name LIKE ?', [`${PREFIX}%`]);
    await query('DELETE FROM skill_categories WHERE name LIKE ?', [`${PREFIX}%`]);
    await query('DELETE FROM social_links WHERE label LIKE ?', [`${PREFIX}%`]);
    await query("DELETE FROM media WHERE object_key LIKE 'it-skill/%'");
  };

  beforeAll(async () => {
    await assertTestDatabase();
    await cleanup();
    await query('INSERT INTO skill_categories (name, sort_order) VALUES (?, -2), (?, -1)', [
      `${PREFIX}A`,
      `${PREFIX}B`,
    ]);
    [{ id: catA }] = await query('SELECT id FROM skill_categories WHERE name = ?', [`${PREFIX}A`]);
    [{ id: catB }] = await query('SELECT id FROM skill_categories WHERE name = ?', [`${PREFIX}B`]);
    await query(
      "INSERT INTO media (kind, object_key, mime, size_bytes) VALUES ('skill_logo', 'it-skill/logo.svg', 'image/svg+xml', 10)"
    );
    [{ id: logoId }] = await query("SELECT id FROM media WHERE object_key = 'it-skill/logo.svg'");
  });

  afterAll(async () => {
    await cleanup();
    await sequelize.close();
  });

  it('menyimpan skill dengan logo dan membacanya kembali beserta data media', async () => {
    const created = await skills.create(
      new Skill({ categoryId: catA, name: `${PREFIX}Node.js`, logoMediaId: logoId, sortOrder: 1 })
    );
    expect(created).toEqual(
      expect.objectContaining({ categoryId: catA, isPublished: true, logoMediaId: logoId })
    );
    expect(created.logo.objectKey).toBe('it-skill/logo.svg');
    expect(created).not.toHaveProperty('category');
  });

  it('findAll: urut kategori lalu sort_order, filter kategori & hanya terbit', async () => {
    await skills.create(
      new Skill({ categoryId: catB, name: `${PREFIX}B2`, sortOrder: 2, isPublished: false })
    );
    await skills.create(
      new Skill({ categoryId: catB, name: `${PREFIX}B1`, sortOrder: 1, isPublished: false })
    );
    await skills.create(
      new Skill({ categoryId: catA, name: `${PREFIX}A0`, sortOrder: 0, isPublished: false })
    );

    const ours = (await skills.findAll())
      .filter((s) => s.name.startsWith(PREFIX))
      .map((s) => s.name);
    expect(ours).toEqual([`${PREFIX}A0`, `${PREFIX}Node.js`, `${PREFIX}B1`, `${PREFIX}B2`]);
    expect((await skills.findAll({ categoryId: catB })).map((s) => s.name)).toEqual([
      `${PREFIX}B1`,
      `${PREFIX}B2`,
    ]);
    expect((await skills.findAll({ publishedOnly: true })).every((s) => s.isPublished)).toBe(true);
  });

  it('countByCategory, findByCategoryAndName, reorder dalam kategori', async () => {
    const counts = await skills.countByCategory();
    expect(counts[catB]).toBe(2);
    const b1 = await skills.findByCategoryAndName(catB, `${PREFIX}B1`);
    const b2 = await skills.findByCategoryAndName(catB, `${PREFIX}B2`);

    await skills.reorder(catB, [b2.id, b1.id]);

    expect((await skills.findAll({ categoryId: catB })).map((s) => s.name)).toEqual([
      `${PREFIX}B2`,
      `${PREFIX}B1`,
    ]);
  });

  it('nama unik per kategori, tapi boleh sama di kategori lain', async () => {
    await expect(
      skills.create(new Skill({ categoryId: catB, name: `${PREFIX}B1`, isPublished: false }))
    ).rejects.toThrow();
    await expect(
      skills.create(new Skill({ categoryId: catA, name: `${PREFIX}B1`, isPublished: false }))
    ).resolves.toBeDefined();
  });

  it('kategori yang masih berisi skill tidak bisa dihapus di level database (RESTRICT)', async () => {
    await expect(query('DELETE FROM skill_categories WHERE id = ?', [catB])).rejects.toThrow(
      /foreign key/i
    );
  });

  it('logo skill dihitung sebagai rujukan media (tidak dianggap yatim)', async () => {
    expect(await media.isReferenced(logoId)).toBe(true);
  });

  it('social links: create, urutan, filter terbit, update label, reorder, delete', async () => {
    const a = await links.create(
      new SocialLink({
        platform: 'github',
        label: `${PREFIX}GH`,
        url: 'https://github.com/a',
        sortOrder: -2,
      })
    );
    const b = await links.create(
      new SocialLink({
        platform: 'x',
        label: `${PREFIX}X`,
        url: 'https://x.com/a',
        isPublished: false,
        sortOrder: -1,
      })
    );

    const all = await links.findAll();
    expect(all.slice(0, 2).map((l) => l.id)).toEqual([a.id, b.id]);
    expect((await links.findAll({ publishedOnly: true })).map((l) => l.id)).not.toContain(b.id);

    const updated = await links.update(a.id, new SocialLink({ ...a, label: `${PREFIX}Kode` }));
    expect(updated.label).toBe(`${PREFIX}Kode`);

    await links.reorder([b.id, a.id]);
    expect((await links.findById(b.id)).sortOrder).toBe(1);

    await links.delete(b.id);
    expect(await links.findById(b.id)).toBeNull();
  });

  it('platform di luar enum ditolak database', async () => {
    await expect(
      links.create(new SocialLink({ platform: 'myspace', label: `${PREFIX}M`, url: 'https://a.b' }))
    ).rejects.toThrow();
  });
});
