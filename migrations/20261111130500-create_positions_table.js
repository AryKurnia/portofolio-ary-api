// Posisi di dalam instansi (jabatan, jenjang pendidikan, kepanitiaan).
// Tanggal disimpan sebagai DATE tanggal 1; API menerima/mengirim format YYYY-MM.
const TABLE_OPTIONS = { charset: 'utf8mb4', collate: 'utf8mb4_uca1400_ai_ci' };

const POSITION_TYPES = [
  'full_time',
  'part_time',
  'freelance',
  'contract',
  'internship',
  'self_employed',
  'member',
  'board',
  'committee',
  'volunteer',
  'education',
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'positions',
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        organization_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'organizations', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        title: { type: Sequelize.STRING(120), allowNull: false },
        type: { type: Sequelize.ENUM(...POSITION_TYPES), allowNull: false },
        event_name: { type: Sequelize.STRING(120), allowNull: true },
        start_date: { type: Sequelize.DATEONLY, allowNull: false },
        end_date: { type: Sequelize.DATEONLY, allowNull: true },
        is_current: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        description: { type: Sequelize.STRING(500), allowNull: true },
        sort_order: { type: Sequelize.INTEGER, allowNull: true },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      },
      TABLE_OPTIONS
    );

    // Aturan periode & committee (API.md §3). Konsistensi group↔type dan batas
    // "maks 1 tahun ke depan" butuh data lain/waktu sekarang, jadi divalidasi di use-case.
    const checks = {
      chk_positions_current_no_end: 'NOT (is_current = 1 AND end_date IS NOT NULL)',
      chk_positions_period_order: 'end_date IS NULL OR end_date >= start_date',
      chk_positions_committee_event: "(type = 'committee') = (event_name IS NOT NULL)",
    };
    for (const [name, condition] of Object.entries(checks)) {
      await queryInterface.sequelize.query(
        `ALTER TABLE positions ADD CONSTRAINT ${name} CHECK (${condition})`
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('positions');
  },
};
