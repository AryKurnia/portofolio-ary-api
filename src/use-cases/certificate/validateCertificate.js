const ValidationError = require('../../exceptions/ValidationError');

// Aturan entity + file yang dirujuk harus upload berjenis certificate_file.
const validateCertificate = async (certificate, mediaRepository, { now } = {}) => {
  const errors = certificate.validate({ now });
  if (certificate.fileMediaId) {
    const media = await mediaRepository.findById(certificate.fileMediaId);
    if (!media || media.kind !== 'certificate_file') {
      errors.push({ field: 'file_id', message: 'Invalid file.' });
    }
  }
  if (errors.length) {
    throw new ValidationError('Some fields are invalid.', errors);
  }
};

module.exports = validateCertificate;
