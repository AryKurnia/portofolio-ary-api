const { DataTypes } = require('sequelize');
const sequelize = require('../sequelizeClient');

const MediaModel = sequelize.define(
  'Media',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    kind: { type: DataTypes.STRING, allowNull: false },
    objectKey: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    mime: { type: DataTypes.STRING(100), allowNull: false },
    sizeBytes: { type: DataTypes.INTEGER, allowNull: false },
    width: { type: DataTypes.INTEGER, allowNull: true },
    height: { type: DataTypes.INTEGER, allowNull: true },
    variants: { type: DataTypes.JSON, allowNull: true },
  },
  { tableName: 'media', underscored: true }
);

module.exports = MediaModel;
