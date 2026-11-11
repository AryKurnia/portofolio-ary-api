const Entity = require('./Entity');

const TYPES = [
  'full_time',
  'part_time',
  'freelance',
  'contract',
  'internship',
  'self_employed',
  'member',
  'board',
  'committee',
  'volunteer',
  'education',
];

// Tanggal dalam format 'YYYY-MM' (string), sehingga bisa dibandingkan secara leksikografis.
const toYearMonth = (date) => date.toISOString().slice(0, 7);

class Position extends Entity {
  constructor({
    organizationId,
    title,
    type,
    eventName = null,
    startDate,
    endDate = null,
    isCurrent = false,
    description = null,
    sortOrder = null,
    ...attrs
  } = {}) {
    super(attrs);
    this.organizationId = organizationId;
    this.title = title;
    this.type = type;
    this.eventName = eventName;
    this.startDate = startDate;
    this.endDate = endDate;
    this.isCurrent = isCurrent;
    this.description = description;
    this.sortOrder = sortOrder;
  }

  /**
   * Aturan bisnis posisi (docs/design/API.md §3). Mengembalikan daftar pelanggaran
   * [{ field, message }] — kosong berarti valid. Nama field mengikuti payload API (snake_case).
   */
  validate({ group, now = new Date() }) {
    const errors = [];
    const add = (field, message) => errors.push({ field, message });

    if (this.isCurrent && this.endDate) {
      add('end_date', 'End date must be empty for a current position.');
    }
    if (this.endDate && this.endDate < this.startDate) {
      add('end_date', 'End date must be on or after the start date.');
    }
    if (this.type === 'committee' && !this.eventName) {
      add('event_name', 'Event name is required for committee positions.');
    }
    if (this.type !== 'committee' && this.eventName) {
      add('event_name', 'Event name is only allowed for committee positions.');
    }

    const maxStart = new Date(now);
    maxStart.setUTCFullYear(maxStart.getUTCFullYear() + 1);
    if (this.startDate > toYearMonth(maxStart)) {
      add('start_date', 'Start date cannot be more than one year in the future.');
    }

    if (group === 'education' && this.type !== 'education') {
      add('type', 'Positions in an education organization must use the education type.');
    }
    if (group === 'work_organization' && this.type === 'education') {
      add('type', 'The education type is only allowed in education organizations.');
    }

    return errors;
  }
}

Position.TYPES = TYPES;

module.exports = Position;
