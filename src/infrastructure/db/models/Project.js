const { DataTypes } = require('sequelize');
const sequelize = require('../sequelizeClient');
const MediaModel = require('./Media');

const ProjectModel = sequelize.define(
  'Project',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(60), allowNull: false },
    description: { type: DataTypes.STRING(300), allowNull: false },
    imageMediaId: { type: DataTypes.INTEGER, allowNull: true },
    linkUrl: { type: DataTypes.STRING(2048), allowNull: true },
    showButton: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { tableName: 'projects', underscored: true }
);

ProjectModel.belongsTo(MediaModel, { as: 'image', foreignKey: 'imageMediaId' });

module.exports = ProjectModel;
