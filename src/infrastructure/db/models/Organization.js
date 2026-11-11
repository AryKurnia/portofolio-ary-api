const { DataTypes } = require('sequelize');
const sequelize = require('../sequelizeClient');
const PositionModel = require('./Position');

const OrganizationModel = sequelize.define(
  'Organization',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    // Kolom group_type: "group" adalah kata kunci SQL.
    group: { type: DataTypes.STRING, allowNull: false, field: 'group_type' },
    location: { type: DataTypes.STRING(80), allowNull: true },
    sortOrder: { type: DataTypes.INTEGER, allowNull: true },
  },
  { tableName: 'organizations', underscored: true }
);

OrganizationModel.hasMany(PositionModel, { as: 'positions', foreignKey: 'organizationId' });
PositionModel.belongsTo(OrganizationModel, { as: 'organization', foreignKey: 'organizationId' });

module.exports = OrganizationModel;
