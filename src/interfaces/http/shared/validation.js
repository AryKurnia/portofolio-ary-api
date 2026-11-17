// Potongan skema Joi yang dipakai lintas resource (aturan API.md §3).
const Joi = require('joi');

const HTML_TAG = /<\/?[a-z][^>]*>/i;

// Teks biasa: di-trim, tanpa tag HTML (konten disimpan sebagai plain text).
const plainText = (max) =>
  Joi.string()
    .trim()
    .max(max)
    .pattern(HTML_TAG, { invert: true })
    .messages({ 'string.pattern.invert.base': '{{#label}} must not contain HTML' });

// URL hanya https (menolak javascript:, http:, dsb.).
const httpsUrl = () =>
  Joi.string()
    .trim()
    .max(2048)
    .uri({ scheme: ['https'] });

// Bulan dalam format YYYY-MM.
const yearMonth = () =>
  Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .messages({ 'string.pattern.base': '{{#label}} must use the YYYY-MM format' });

const idParamSchema = Joi.object({ id: Joi.number().integer().positive().required() });

const reorderPayloadSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).unique().required(),
});

module.exports = { plainText, httpsUrl, yearMonth, idParamSchema, reorderPayloadSchema };
