const { DataTypes } = require('sequelize');
const sequelize = require('../sequelizeClient');

const SocialMediaModel = sequelize.define(
  'SocialMedia',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'social_media',
    underscored: true, // otomatis map createdAt -> created_at, dst
  }
);

module.exports = SocialMediaModel;