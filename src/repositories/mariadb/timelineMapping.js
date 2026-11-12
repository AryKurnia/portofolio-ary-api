// Konversi baris timeline ↔ entity (tanggal 'YYYY-MM' ↔ kolom DATE tanggal 1).
const Organization = require('../../entities/Organization');
const Position = require('../../entities/Position');
const { toYearMonth, toDateColumn } = require('./yearMonthColumn');

const toPosition = (row) => {
  const data = row.toJSON ? row.toJSON() : row;
  return new Position({
    ...data,
    startDate: toYearMonth(data.startDate),
    endDate: toYearMonth(data.endDate),
    isCurrent: Boolean(data.isCurrent),
  });
};

const toOrganization = (row) => {
  const { positions = [], ...data } = row.toJSON();
  return new Organization({ ...data, positions: positions.map(toPosition) });
};

const toPositionColumns = (position) => ({
  title: position.title,
  type: position.type,
  eventName: position.eventName,
  startDate: toDateColumn(position.startDate),
  endDate: toDateColumn(position.endDate),
  isCurrent: position.isCurrent,
  description: position.description,
  sortOrder: position.sortOrder,
});

module.exports = { toPosition, toOrganization, toPositionColumns };
