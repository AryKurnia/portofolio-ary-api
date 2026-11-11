// Bentuk respons PUBLIK: hanya field yang dibutuhkan halaman portofolio (tanpa data admin).
const { periodLabel, TYPE_LABELS } = require('../timeline/presenter');
const { toImageResponse } = require('../shared/media');
const { displayLabel } = require('../social-links/presenter');

const toPublicProfile = (profile) => ({
  greeting: profile.greeting,
  tagline: profile.tagline,
  about: profile.about,
  project_intro: profile.projectIntro || null,
  email: profile.email,
  photo: toImageResponse(profile.photo),
});

const toPublicProject = (project) => ({
  id: project.id,
  title: project.title,
  description: project.description,
  image: toImageResponse(project.image),
  link_url: project.linkUrl,
  show_button: project.showButton,
});

const toPublicPosition = (position) => ({
  id: position.id,
  title: position.title,
  type: position.type,
  type_label: TYPE_LABELS[position.type],
  event_name: position.eventName,
  start_date: position.startDate,
  end_date: position.endDate,
  is_current: position.isCurrent,
  period_label: periodLabel(position),
  description: position.description,
});

const toPublicOrganization = (organization) => ({
  id: organization.id,
  name: organization.name,
  location: organization.location,
  is_current: organization.positions.some((position) => position.isCurrent),
  positions: organization.positions.map(toPublicPosition),
});

const toPublicTimeline = (timeline) =>
  Object.fromEntries(
    Object.entries(timeline).map(([group, organizations]) => [
      group,
      organizations.map(toPublicOrganization),
    ])
  );

const toPublicSocialLink = (link) => ({
  platform: link.platform,
  label: displayLabel(link),
  url: link.url,
});

const toPublicSkillGroups = (groups) =>
  groups.map(({ category, items }) => ({
    category: { id: category.id, name: category.name },
    items: items.map((skill) => ({
      id: skill.id,
      name: skill.name,
      logo: toImageResponse(skill.logo),
    })),
  }));

const toPublicPortfolio = ({ profile, skills, projects, timeline, socialLinks }) => ({
  profile: toPublicProfile(profile),
  skills: toPublicSkillGroups(skills),
  projects: {
    items: projects.items.map(toPublicProject),
    total: projects.total,
    has_more: projects.hasMore,
  },
  timeline: toPublicTimeline(timeline),
  social_links: socialLinks.map(toPublicSocialLink),
});

module.exports = {
  toPublicProfile,
  toPublicProject,
  toPublicTimeline,
  toPublicSocialLink,
  toPublicSkillGroups,
  toPublicPortfolio,
};
