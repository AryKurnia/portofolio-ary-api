// Constraint level database (migrasi M3). Setiap percobaan dijalankan dalam transaksi yang di-rollback.
// Penolakan wajib menyebut alasan yang diharapkan — bukan sekadar "gagal" (mencegah positif palsu).
const { sequelize, assertTestDatabase, query } = require('./db');

describe('Constraint skema (MariaDB tes)', () => {
  let organizationId;

  const run = async (sql) => {
    const transaction = await sequelize.transaction();
    try {
      await sequelize.query(sql, { transaction });
    } catch (error) {
      // Sequelize membungkus sebagian error (mis. unique → "Validation error"); pakai pesan asli MariaDB.
      throw new Error(error.parent?.sqlMessage ?? error.message, { cause: error });
    } finally {
      await transaction.rollback();
    }
  };

  beforeAll(async () => {
    await assertTestDatabase();
    await query(
      "INSERT INTO organizations (name, group_type) VALUES ('[it-schema] Org', 'work_organization')"
    );
    [{ id: organizationId }] = await query(
      "SELECT id FROM organizations WHERE name = '[it-schema] Org'"
    );
  });

  afterAll(async () => {
    await query("DELETE FROM organizations WHERE name LIKE '[it-schema]%'");
    await sequelize.close();
  });

  const position = (columns, values) =>
    `INSERT INTO positions (organization_id, title, ${columns}) VALUES (${organizationId}, 'Tes', ${values})`;

  it.each([
    [
      'profile baris kedua',
      "INSERT INTO profile (id, greeting, tagline, about, email) VALUES (2,'a','b','c','d@e.f')",
      'chk_profile_singleton',
      null,
    ],
    [
      'project show_button=1 tanpa link',
      "INSERT INTO projects (title, description, show_button) VALUES ('a','b',1)",
      'chk_projects_button_needs_link',
      null,
    ],
    [
      'posisi current dengan end_date',
      null,
      'chk_positions_current_no_end',
      ['type, start_date, end_date, is_current', "'member','2023-01-01','2024-01-01',1"],
    ],
    [
      'end_date sebelum start_date',
      null,
      'chk_positions_period_order',
      ['type, start_date, end_date', "'member','2024-01-01','2023-01-01'"],
    ],
    [
      'committee tanpa event_name',
      null,
      'chk_positions_committee_event',
      ['type, start_date', "'committee','2024-01-01'"],
    ],
    [
      'event_name pada non-committee',
      null,
      'chk_positions_committee_event',
      ['type, event_name, start_date', "'member','Diksar','2024-01-01'"],
    ],
    ['type di luar enum', null, 'Data truncated', ['type, start_date', "'ceo','2024-01-01'"]],
    [
      'posisi ke organisasi yang tidak ada',
      "INSERT INTO positions (organization_id, title, type, start_date) VALUES (999999,'x','member','2024-01-01')",
      'foreign key constraint fails',
      null,
    ],
  ])('menolak %s', async (_label, sql, reason, positionArgs) => {
    await expect(run(sql ?? position(...positionArgs))).rejects.toThrow(reason);
  });

  it('menolak nama kategori skill dan nama+grup organisasi yang duplikat', async () => {
    await expect(
      run("INSERT INTO skill_categories (name) VALUES ('[it-schema] K'), ('[it-schema] K')")
    ).rejects.toThrow('Duplicate entry');
    await expect(
      run(
        "INSERT INTO organizations (name, group_type) VALUES ('[it-schema] Org', 'work_organization')"
      )
    ).rejects.toThrow('Duplicate entry');
  });

  it.each([
    [
      'project show_button=1 dengan link',
      "INSERT INTO projects (title, description, show_button, link_url) VALUES ('a','b',1,'https://x.dev')",
    ],
    [
      'nama organisasi sama di grup berbeda',
      "INSERT INTO organizations (name, group_type) VALUES ('[it-schema] Org','education')",
    ],
    ['committee dengan event_name tanpa end_date', null],
    ['emoji (utf8mb4)', "INSERT INTO skill_categories (name) VALUES ('[it-schema] 🚀')"],
  ])('menerima %s', async (_label, sql) => {
    await expect(
      run(sql ?? position('type, event_name, start_date', "'committee','Diksar','2024-01-01'"))
    ).resolves.toBeUndefined();
  });

  it('timestamp terisi otomatis oleh database (DEFAULT CURRENT_TIMESTAMP)', async () => {
    await expect(
      run("INSERT INTO skill_categories (name) VALUES ('[it-schema] TS')")
    ).resolves.toBeUndefined();
  });
});
