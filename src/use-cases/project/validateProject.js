const ValidationError = require('../../exceptions/ValidationError');

// Aturan entity + gambar yang dirujuk harus benar-benar ada di tabel media.
const validateProject = async (project, mediaRepository) => {
  const errors = project.validate();
  if (project.imageMediaId) {
    const media = await mediaRepository.findById(project.imageMediaId);
    if (!media) {
      errors.push({ field: 'image_id', message: 'Image was not found. Upload it first.' });
    } else if (media.kind !== 'project_image') {
      errors.push({ field: 'image_id', message: 'Image must be uploaded as a project image.' });
    }
  }
  if (errors.length) {
    throw new ValidationError('Some fields are invalid.', errors);
  }
};

module.exports = validateProject;
