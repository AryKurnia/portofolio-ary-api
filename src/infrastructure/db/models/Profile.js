const { DataTypes } = require('sequelize');
const sequelize = require('../sequelizeClient');
const MediaModel = require('./Media');

const ProfileModel = sequelize.define(
  'Profile',
  {
    id: { type: DataTypes.TINYINT.UNSIGNED, primaryKey: true, defaultValue: 1 },
    greeting: { type: DataTypes.STRING(80), allowNull: false },
    tagline: { type: DataTypes.STRING(120), allowNull: false },
    about: { type: DataTypes.TEXT, allowNull: false },
    projectIntro: { type: DataTypes.STRING(200), allowNull: true },
    email: { type: DataTypes.STRING(254), allowNull: false },
    photoMediaId: { type: DataTypes.INTEGER, allowNull: true },
  },
  { tableName: 'profile', underscored: true }
);

ProfileModel.belongsTo(MediaModel, { as: 'photo', foreignKey: 'photoMediaId' });

module.exports = ProfileModel;
