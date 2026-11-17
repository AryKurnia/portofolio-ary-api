const PLATFORM_LABELS = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  discord: 'Discord',
  x: 'X',
  other: 'Link',
};

// Label tampilan: label kustom bila ada, selain itu nama platform (API.md §2.3).
const displayLabel = (link) => link.label ?? PLATFORM_LABELS[link.platform] ?? 'Link';

const toSocialLinkResponse = (link) => ({
  id: link.id,
  platform: link.platform,
  label: link.label,
  display_label: displayLabel(link),
  url: link.url,
  is_published: link.isPublished,
  sort_order: link.sortOrder,
});

module.exports = { toSocialLinkResponse, displayLabel };
