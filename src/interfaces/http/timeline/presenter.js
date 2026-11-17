const TYPE_LABELS = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  freelance: 'Freelance',
  contract: 'Contract',
  internship: 'Internship',
  self_employed: 'Self-employed',
  member: 'Member',
  board: 'Board',
  committee: 'Committee',
  volunteer: 'Volunteer',
  education: 'Education',
};

const EN_DASH = '–';

/**
 * Label periode (API.md §5): "YYYY – YYYY", "YYYY – Present" bila current, atau "YYYY" bila
 * tanpa end_date. Bila tahun mulai dan selesai sama, cukup "YYYY".
 */
const periodLabel = ({ startDate, endDate, isCurrent }) => {
  const startYear = startDate.slice(0, 4);
  if (isCurrent) return `${startYear} ${EN_DASH} Present`;
  if (!endDate) return startYear;
  const endYear = endDate.slice(0, 4);
  return endYear === startYear ? startYear : `${startYear} ${EN_DASH} ${endYear}`;
};

const toPositionResponse = (position) => ({
  id: position.id,
  organization_id: position.organizationId,
  title: position.title,
  type: position.type,
  type_label: TYPE_LABELS[position.type],
  event_name: position.eventName,
  start_date: position.startDate,
  end_date: position.endDate,
  is_current: position.isCurrent,
  period_label: periodLabel(position),
  description: position.description,
  sort_order: position.sortOrder,
});

const toOrganizationResponse = (organization) => ({
  id: organization.id,
  name: organization.name,
  group: organization.group,
  location: organization.location,
  sort_order: organization.sortOrder,
  is_current: organization.positions.some((position) => position.isCurrent),
  positions: organization.positions.map(toPositionResponse),
});

module.exports = { periodLabel, toPositionResponse, toOrganizationResponse, TYPE_LABELS };
