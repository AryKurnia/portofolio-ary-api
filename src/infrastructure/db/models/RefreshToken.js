const { DataTypes } = require('sequelize');
const sequelize = require('../sequelizeClient');

const RefreshTokenModel = sequelize.define(
  'RefreshToken',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    tokenHash: { type: DataTypes.CHAR(64), allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    revokedAt: { type: DataTypes.DATE, allowNull: true },
    replacedById: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: 'refresh_tokens',
    underscored: true, // userId -> user_id, dst
  }
);

module.exports = RefreshTokenModel;
