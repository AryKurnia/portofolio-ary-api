const bcrypt = require('bcrypt');
const BcryptPasswordHasher = require('./BcryptPasswordHasher');

// Cost 4 (minimum bcrypt) agar tes cepat; perilakunya sama dengan cost produksi.
describe('BcryptPasswordHasher', () => {
  const hasher = new BcryptPasswordHasher({ cost: 4 });

  it('hash bisa diverifikasi dengan password yang benar dan menolak yang salah', async () => {
    // ARRANGE
    const hash = await hasher.hash('rahasia');

    // ASSERT
    await expect(hasher.compare('rahasia', hash)).resolves.toBe(true);
    await expect(hasher.compare('salah', hash)).resolves.toBe(false);
  });

  it('compare dengan hash null selalu false (tetap menjalankan bcrypt untuk timing)', async () => {
    // ARRANGE
    const compareSpy = jest.spyOn(bcrypt, 'compare');

    // ACT
    const result = await hasher.compare('apapun', null);

    // ASSERT
    expect(result).toBe(false);
    expect(compareSpy).toHaveBeenCalled();
    compareSpy.mockRestore();
  });

  it('needsRehash true kalau cost hash lebih rendah dari konfigurasi', async () => {
    // ARRANGE
    const hasher12 = new BcryptPasswordHasher({ cost: 12 });
    const oldHash = await bcrypt.hash('x', 4);

    // ASSERT
    expect(hasher12.needsRehash(oldHash)).toBe(true);
    expect(hasher.needsRehash(oldHash)).toBe(false);
  });
});
