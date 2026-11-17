// Menambah kolom username (login admin kini memakai username, keputusan K5).
// Baris yang sudah ada diisi dari bagian sebelum '@' pada email; ubah manual setelahnya bila perlu:
//   UPDATE users SET username = 'nama-pilihan' WHERE id = 1;
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'username', {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: 'id',
    });

    await queryInterface.sequelize.query(
      "UPDATE users SET username = SUBSTRING_INDEX(email, '@', 1) WHERE username IS NULL"
    );

    await queryInterface.changeColumn('users', 'username', {
      type: Sequelize.STRING(50),
      allowNull: false,
    });
    await queryInterface.addIndex('users', ['username'], {
      name: 'users_username_unique',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('users', 'users_username_unique');
    await queryInterface.removeColumn('users', 'username');
  },
};
