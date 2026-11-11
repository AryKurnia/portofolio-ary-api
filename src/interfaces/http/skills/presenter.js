// Bentuk JSON publik untuk Skill (snake_case, field eksplisit — atribut entity lain tidak ikut bocor).
const toSkillResponse = (skill) => ({
  id: skill.id,
  name: skill.name,
  logo_url: skill.logoUrl ?? null,
  description: skill.description ?? null,
  enabled: skill.enabled,
  created_at: skill.createdAt,
  updated_at: skill.updatedAt,
});

module.exports = { toSkillResponse };
