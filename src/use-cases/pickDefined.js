// Payload PATCH bersifat parsial: field yang tidak dikirim (undefined) tidak boleh menimpa nilai lama.
// null tetap diteruskan karena berarti "kosongkan".
const pickDefined = (object) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));

module.exports = pickDefined;
