module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'refresh_tokens',
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        // SHA-256 (hex) dari token; token asli tidak pernah disimpan.
        token_hash: { type: Sequelize.CHAR(64), allowNull: false, unique: true },
        expires_at: { type: Sequelize.DATE, allowNull: false },
        revoked_at: { type: Sequelize.DATE, allowNull: true },
        replaced_by_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'refresh_tokens', key: 'id' },
          onDelete: 'SET NULL',
        },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      },
      { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
    );

    await queryInterface.addIndex('refresh_tokens', ['user_id']);
    await queryInterface.addIndex('refresh_tokens', ['expires_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('refresh_tokens');
  },
};
