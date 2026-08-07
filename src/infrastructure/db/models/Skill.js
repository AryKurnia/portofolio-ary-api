const { DataTypes } = require('sequelize');
const sequelize = require('../sequelizeClient');

const SkillModel = sequelize.define(
  'Skill',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    logoUrl: { type: DataTypes.STRING, allowNull: true, field: 'logo_url' },
    description: { type: DataTypes.TEXT, allowNull: true },
    enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    tableName: 'skills',
    underscored: true, // otomatis map createdAt -> created_at, dst
  }
);

module.exports = SkillModel;