const ValidationError = require('../exceptions/ValidationError');

// Hasil drag & drop: ids harus memuat SEMUA item saat ini tepat satu kali.
const assertCompleteOrder = (currentIds, requestedIds, itemLabel) => {
  const current = [...currentIds].sort((a, b) => a - b);
  const requested = [...requestedIds].sort((a, b) => a - b);
  const isSamePermutation =
    current.length === requested.length && current.every((id, index) => id === requested[index]);

  if (!isSamePermutation) {
    throw new ValidationError('Some fields are invalid.', [
      { field: 'ids', message: `ids must contain every ${itemLabel} exactly once.` },
    ]);
  }
};

module.exports = assertCompleteOrder;
