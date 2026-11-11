const ValidationError = require('../../exceptions/ValidationError');
const ConflictError = require('../../exceptions/ConflictError');

// Aturan entity + kategori ada + logo hasil upload kind=skill_logo + nama unik per kategori.
const validateSkill = async (
  skill,
  { skillCategoryRepository, mediaRepository, skillRepository },
  excludeId
) => {
  const errors = skill.validate();

  if (!(await skillCategoryRepository.findById(skill.categoryId))) {
    errors.push({ field: 'category_id', message: 'Skill category was not found.' });
  }
  if (skill.logoMediaId) {
    const media = await mediaRepository.findById(skill.logoMediaId);
    if (!media) {
      errors.push({ field: 'logo_id', message: 'Logo was not found. Upload it first.' });
    } else if (media.kind !== 'skill_logo') {
      errors.push({ field: 'logo_id', message: 'Logo must be uploaded as a skill logo.' });
    }
  }
  if (errors.length) {
    throw new ValidationError('Some fields are invalid.', errors);
  }

  const duplicate = await skillRepository.findByCategoryAndName(skill.categoryId, skill.name);
  if (duplicate && duplicate.id !== excludeId) {
    throw new ConflictError('A skill with this name already exists in this category.', [
      { field: 'name', message: 'Name is already used in this category.' },
    ]);
  }
};

module.exports = validateSkill;
