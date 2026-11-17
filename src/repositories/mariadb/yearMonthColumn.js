// Konversi antara domain (tanggal 'YYYY-MM') dan kolom DATE (tanggal 1).
const toYearMonth = (date) => (date ? String(date).slice(0, 7) : null);
const toDateColumn = (yearMonth) => (yearMonth ? `${yearMonth}-01` : null);

module.exports = { toYearMonth, toDateColumn };
