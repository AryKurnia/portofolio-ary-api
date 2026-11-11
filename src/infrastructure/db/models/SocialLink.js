const { DataTypes } = require('sequelize');
const sequelize = require('../sequelizeClient');

const SocialLinkModel = sequelize.define(
  'SocialLink',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    platform: { type: DataTypes.STRING, allowNull: false },
    label: { type: DataTypes.STRING(40), allowNull: true },
    url: { type: DataTypes.STRING(2048), allowNull: false },
    isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { tableName: 'social_links', underscored: true }
);

module.exports = SocialLinkModel;
