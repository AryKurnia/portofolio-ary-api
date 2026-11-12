const { DataTypes } = require('sequelize');
const sequelize = require('../sequelizeClient');
const MediaModel = require('./Media');

const CertificateModel = sequelize.define(
  'Certificate',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    issuer: { type: DataTypes.STRING(100), allowNull: false },
    issuedAt: { type: DataTypes.DATEONLY, allowNull: false },
    expiresAt: { type: DataTypes.DATEONLY, allowNull: true },
    credentialId: { type: DataTypes.STRING(100), allowNull: true },
    credentialUrl: { type: DataTypes.STRING(2048), allowNull: true },
    fileMediaId: { type: DataTypes.INTEGER, allowNull: true },
    isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { tableName: 'certificates', underscored: true }
);

CertificateModel.belongsTo(MediaModel, { as: 'file', foreignKey: 'fileMediaId' });

module.exports = CertificateModel;
