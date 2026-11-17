// Skill baru / pindah kategori ditaruh paling akhir di kategori tujuan.
const nextSortOrder = async (skillRepository, categoryId) => {
  const skills = await skillRepository.findAll({ categoryId });
  return Math.max(0, ...skills.map((skill) => skill.sortOrder)) + 1;
};

module.exports = nextSortOrder;
