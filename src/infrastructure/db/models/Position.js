const { DataTypes } = require('sequelize');
const sequelize = require('../sequelizeClient');

const PositionModel = sequelize.define(
  'Position',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    organizationId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(120), allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    eventName: { type: DataTypes.STRING(120), allowNull: true },
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY, allowNull: true },
    isCurrent: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    description: { type: DataTypes.STRING(500), allowNull: true },
    sortOrder: { type: DataTypes.INTEGER, allowNull: true },
  },
  { tableName: 'positions', underscored: true }
);

module.exports = PositionModel;
