// Instansi pada timeline (model LinkedIn): sekolah/kampus, tempat kerja, organisasi.
const TABLE_OPTIONS = { charset: 'utf8mb4', collate: 'utf8mb4_uca1400_ai_ci' };

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'organizations',
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING(120), allowNull: false },
        // "group" adalah kata kunci SQL; di API tetap dikirim sebagai `group`.
        group_type: {
          type: Sequelize.ENUM('education', 'work_organization'),
          allowNull: false,
        },
        location: { type: Sequelize.STRING(80), allowNull: true },
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

    await queryInterface.addIndex('organizations', ['name', 'group_type'], {
      name: 'organizations_name_group_unique',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('organizations');
  },
};
