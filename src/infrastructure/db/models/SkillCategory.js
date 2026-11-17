const { DataTypes } = require('sequelize');
const sequelize = require('../sequelizeClient');

const SkillCategoryModel = sequelize.define(
  'SkillCategory',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(40), allowNull: false, unique: true },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { tableName: 'skill_categories', underscored: true }
);

module.exports = SkillCategoryModel;
