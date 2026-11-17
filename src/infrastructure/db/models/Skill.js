const { DataTypes } = require('sequelize');
const sequelize = require('../sequelizeClient');
const MediaModel = require('./Media');
const SkillCategoryModel = require('./SkillCategory');

const SkillModel = sequelize.define(
  'Skill',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    categoryId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(40), allowNull: false },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    logoMediaId: { type: DataTypes.INTEGER, allowNull: true },
    isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: 'skills', underscored: true }
);

SkillModel.belongsTo(MediaModel, { as: 'logo', foreignKey: 'logoMediaId' });
SkillModel.belongsTo(SkillCategoryModel, { as: 'category', foreignKey: 'categoryId' });

module.exports = SkillModel;
