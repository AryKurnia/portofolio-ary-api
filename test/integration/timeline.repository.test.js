const { sequelize, assertTestDatabase, query } = require('./db');
const MariaDBOrganizationRepository = require('../../src/repositories/mariadb/MariaDBOrganizationRepository');
const MariaDBPositionRepository = require('../../src/repositories/mariadb/MariaDBPositionRepository');
const Organization = require('../../src/entities/Organization');
const Position = require('../../src/entities/Position');

describe('Repository timeline (MariaDB tes)', () => {
  const organizations = new MariaDBOrganizationRepository();
  const positions = new MariaDBPositionRepository();
  const PREFIX = '[it] ';

  const cleanup = () => query('DELETE FROM organizations WHERE name LIKE ?', [`${PREFIX}%`]);

  beforeAll(async () => {
    await assertTestDatabase();
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await sequelize.close();
  });

  const createOrg = (name, group = 'work_organization') =>
    organizations.create(new Organization({ name: `${PREFIX}${name}`, group }));

  it('menyimpan dan membaca posisi dengan tanggal YYYY-MM dan boolean asli', async () => {
    // ARRANGE
    const org = await createOrg('MAPALA');

    // ACT
    const created = await positions.create(
      new Position({
        organizationId: org.id,
        title: 'Ketua Panitia',
        type: 'committee',
        eventName: 'Diksar',
        startDate: '2024-03',
      })
    );
    const reloaded = await organizations.findById(org.id);

    // ASSERT
    expect(created).toEqual(
      expect.objectContaining({
        startDate: '2024-03',
        endDate: null,
        isCurrent: false,
        eventName: 'Diksar',
      })
    );
    expect(reloaded.group).toBe('work_organization');
    expect(reloaded.positions).toHaveLength(1);
    expect(reloaded.positions[0]).toBeInstanceOf(Position);
    const [row] = await query('SELECT start_date FROM positions WHERE id = ?', [created.id]);
    expect(String(row.start_date)).toBe('2024-03-01');
  });

  it('findAll memfilter berdasarkan group dan findByNameAndGroup membedakan grup', async () => {
    // ARRANGE
    await createOrg('Kampus', 'education');
    await createOrg('Kampus', 'work_organization');

    // ACT
    const education = await organizations.findAll({ group: 'education' });
    const found = await organizations.findByNameAndGroup(`${PREFIX}Kampus`, 'education');

    // ASSERT
    expect(education.every((o) => o.group === 'education')).toBe(true);
    expect(found.group).toBe('education');
  });

  it('update hanya mengubah kolom posisi yang diberikan entity', async () => {
    const org = await createOrg('Ikhwannet');
    const created = await positions.create(
      new Position({
        organizationId: org.id,
        title: 'Co-Founder',
        type: 'full_time',
        startDate: '2025-01',
        isCurrent: true,
      })
    );

    const updated = await positions.update(
      created.id,
      new Position({ ...created, title: 'Founder' })
    );

    expect(updated).toEqual(
      expect.objectContaining({ title: 'Founder', isCurrent: true, startDate: '2025-01' })
    );
  });

  it('reorder menyimpan sort_order sesuai urutan ids', async () => {
    const org = await createOrg('Urutan');
    const a = await positions.create(
      new Position({ organizationId: org.id, title: 'A', type: 'member', startDate: '2020-01' })
    );
    const b = await positions.create(
      new Position({ organizationId: org.id, title: 'B', type: 'member', startDate: '2020-01' })
    );

    await positions.reorder(org.id, [b.id, a.id]);

    expect((await positions.findById(b.id)).sortOrder).toBe(1);
    expect((await positions.findById(a.id)).sortOrder).toBe(2);
  });

  it('hapus organisasi ikut menghapus posisinya (CASCADE)', async () => {
    const org = await createOrg('Hapus');
    const p = await positions.create(
      new Position({ organizationId: org.id, title: 'A', type: 'member', startDate: '2020-01' })
    );

    await organizations.delete(org.id);

    expect(await organizations.findById(org.id)).toBeNull();
    expect(await positions.findById(p.id)).toBeNull();
  });

  it('CHECK constraint database tetap menolak data yang lolos dari use-case (jaring pengaman)', async () => {
    const org = await createOrg('Jaring');
    const invalid = new Position({
      organizationId: org.id,
      title: 'Ketua',
      type: 'committee',
      startDate: '2024-01',
    });

    await expect(positions.create(invalid)).rejects.toThrow(/chk_positions_committee_event/);
  });
});
