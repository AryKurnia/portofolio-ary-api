// Memastikan container (tanpa mock) merakit semua use-case dengan dependensi lengkap.
// Mencegah kasus seperti dependensi GetPortfolio yang lupa diteruskan — tes unit lain
// tidak menangkapnya karena memakai container palsu.
const container = require('./container');

describe('container', () => {
  it('setiap use-case punya execute()', () => {
    const useCases = Object.entries(container).filter(([name]) => name !== 'mediaUrlFor');
    expect(useCases.length).toBeGreaterThan(40);
    for (const [, useCase] of useCases) {
      expect(typeof useCase.execute).toBe('function');
    }
  });

  it('tidak ada dependensi use-case (properti _xxx) yang undefined', () => {
    for (const [name, useCase] of Object.entries(container)) {
      if (name === 'mediaUrlFor') continue;
      const missing = Object.entries(useCase)
        .filter(([key, value]) => key.startsWith('_') && value === undefined)
        .map(([key]) => key);
      expect({ [name]: missing }).toEqual({ [name]: [] });
    }
  });

  it('mediaUrlFor membentuk URL publik dari object key', () => {
    expect(container.mediaUrlFor('a/b.webp')).toMatch(/\/a\/b\.webp$/);
  });
});
