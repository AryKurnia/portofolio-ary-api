const Entity = require('./Entity');

const GROUPS = ['education', 'work_organization'];

class Organization extends Entity {
  constructor({ name, group, location = null, sortOrder = null, positions = [], ...attrs } = {}) {
    super(attrs);
    this.name = name;
    this.group = group;
    this.location = location;
    this.sortOrder = sortOrder;
    this.positions = positions;
  }

  get isCurrent() {
    return this.positions.some((position) => position.isCurrent);
  }

  /**
   * Urutan timeline (docs/design/API.md §6):
   * - posisi: is_current DESC → start_date DESC → sort_order ASC (null terakhir)
   * - organisasi: punya posisi current dulu → start_date posisi terbaru DESC → sort_order ASC
   * Mengembalikan array baru; tidak mengubah input.
   */
  static sortForTimeline(organizations) {
    const bySortOrder = (a, b) => (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity);
    const sortPositions = (positions) =>
      [...positions].sort(
        (a, b) =>
          Number(b.isCurrent) - Number(a.isCurrent) ||
          b.startDate.localeCompare(a.startDate) ||
          bySortOrder(a, b)
      );
    const latestStart = (organization) =>
      organization.positions.reduce(
        (latest, position) => (position.startDate > latest ? position.startDate : latest),
        ''
      );

    return organizations
      .map((organization) => {
        const sorted = new Organization({
          ...organization,
          positions: sortPositions(organization.positions),
        });
        return sorted;
      })
      .sort(
        (a, b) =>
          Number(b.isCurrent) - Number(a.isCurrent) ||
          latestStart(b).localeCompare(latestStart(a)) ||
          bySortOrder(a, b)
      );
  }
}

Organization.GROUPS = GROUPS;

module.exports = Organization;
