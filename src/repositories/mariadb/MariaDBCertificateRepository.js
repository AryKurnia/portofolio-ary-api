const CertificateRepository = require('../CertificateRepository');
const Certificate = require('../../entities/Certificate');
const Media = require('../../entities/Media');
const CertificateModel = require('../../infrastructure/db/models/Certificate');
const reorderBySortOrder = require('./reorderBySortOrder');
const { toYearMonth, toDateColumn } = require('./yearMonthColumn');

const toCertificate = (row) => {
  const { file, ...data } = row.toJSON();
  return new Certificate({
    ...data,
    issuedAt: toYearMonth(data.issuedAt),
    expiresAt: toYearMonth(data.expiresAt),
    isPublished: Boolean(data.isPublished),
    file: file ? new Media(file) : null,
  });
};

const toColumns = (certificate) => ({
  name: certificate.name,
  issuer: certificate.issuer,
  issuedAt: toDateColumn(certificate.issuedAt),
  expiresAt: toDateColumn(certificate.expiresAt),
  credentialId: certificate.credentialId,
  credentialUrl: certificate.credentialUrl,
  fileMediaId: certificate.fileMediaId,
  isPublished: certificate.isPublished,
  sortOrder: certificate.sortOrder,
});

class MariaDBCertificateRepository extends CertificateRepository {
  constructor(certificateModel = CertificateModel) {
    super();
    this._model = certificateModel;
    this._withFile = { include: [{ association: 'file' }] };
  }

  async findAll({ publishedOnly = false } = {}) {
    const rows = await this._model.findAll({
      ...this._withFile,
      where: publishedOnly ? { isPublished: true } : {},
      order: [
        ['sortOrder', 'ASC'],
        ['id', 'ASC'],
      ],
    });
    return rows.map(toCertificate);
  }

  async findById(id) {
    const row = await this._model.findByPk(id, this._withFile);
    return row ? toCertificate(row) : null;
  }

  async create(certificate) {
    const row = await this._model.create(toColumns(certificate));
    return this.findById(row.id);
  }

  async update(id, certificate) {
    await this._model.update(toColumns(certificate), { where: { id } });
    return this.findById(id);
  }

  async delete(id) {
    await this._model.destroy({ where: { id } });
  }

  async reorder(orderedIds) {
    await reorderBySortOrder(this._model, orderedIds);
  }
}

module.exports = MariaDBCertificateRepository;
