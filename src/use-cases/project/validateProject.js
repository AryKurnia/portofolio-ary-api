const ValidationError = require('../../exceptions/ValidationError');

// Aturan entity + gambar yang dirujuk harus benar-benar ada di tabel media.
const validateProject = async (project, mediaRepository) => {
  const errors = project.validate();
  if (project.imageMediaId && !(await mediaRepository.findById(project.imageMediaId))) {
    errors.push({ field: 'image_id', message: 'Image was not found. Upload it first.' });
  }
  if (errors.length) {
    throw new ValidationError('Some fields are invalid.', errors);
  }
};

module.exports = validateProject;
