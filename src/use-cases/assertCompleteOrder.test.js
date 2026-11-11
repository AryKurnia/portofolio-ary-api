const assertCompleteOrder = require('./assertCompleteOrder');
const ValidationError = require('../exceptions/ValidationError');

describe('assertCompleteOrder', () => {
  it('menerima permutasi lengkap dalam urutan apa pun', () => {
    expect(() => assertCompleteOrder([1, 2, 3], [3, 1, 2], 'item')).not.toThrow();
  });

  it.each([
    ['id hilang', [1, 2]],
    ['id asing', [1, 2, 9]],
    ['id ganda', [1, 1, 2]],
  ])('menolak bila %s, dengan detail pada field ids', (_label, ids) => {
    expect(() => assertCompleteOrder([1, 2, 3], ids, 'item')).toThrow(ValidationError);
    try {
      assertCompleteOrder([1, 2, 3], ids, 'item');
    } catch (error) {
      expect(error.details[0].field).toBe('ids');
    }
  });
});
