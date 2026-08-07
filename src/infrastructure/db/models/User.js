const { DataTypes } = require('sequelize');
const sequelize = require('../sequelizeClient');

const UserModel = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false, field: 'password_hash' },
  },
  {
    tableName: 'users',
    underscored: true,
  }
);

module.exports = UserModel;