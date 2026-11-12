const Certificate = require('./Certificate');

describe('Certificate entity', () => {
  const now = new Date('2026-11-12T00:00:00Z');
  const base = { name: 'AWS', issuer: 'Amazon', issuedAt: '2025-03' };
  const fieldsOf = (attrs) => new Certificate({ ...base, ...attrs }).validate({ now });

  it('default: draf, tanpa kedaluwarsa, tanpa file', () => {
    expect(new Certificate(base)).toEqual(
      expect.objectContaining({
        expiresAt: null,
        credentialId: null,
        credentialUrl: null,
        fileMediaId: null,
        isPublished: false,
        sortOrder: 0,
      })
    );
  });

  it('draf tanpa file dan tanpa credential URL valid', () => {
    expect(fieldsOf({})).toEqual([]);
  });

  it.each([
    ['file', { fileMediaId: 4 }],
    ['credential URL', { credentialUrl: 'https://verify.example/1' }],
  ])('terbit dengan %s saja valid', (_label, attrs) => {
    expect(fieldsOf({ ...attrs, isPublished: true })).toEqual([]);
  });

  it('terbit tanpa file dan tanpa credential URL ditolak', () => {
    expect(fieldsOf({ isPublished: true })).toEqual([
      { field: 'file_id', message: 'Add a file or a credential URL to publish.' },
    ]);
  });

  it('kedaluwarsa sebelum tanggal terbit ditolak; bulan yang sama diterima', () => {
    expect(fieldsOf({ expiresAt: '2025-02' })).toEqual([
      { field: 'expires_at', message: 'Expiry must be after the issue date.' },
    ]);
    expect(fieldsOf({ expiresAt: '2025-03' })).toEqual([]);
  });

  it('tanggal terbit bulan ini diterima, bulan depan ditolak', () => {
    expect(fieldsOf({ issuedAt: '2026-11' })).toEqual([]);
    expect(fieldsOf({ issuedAt: '2026-12' })).toEqual([
      { field: 'issued_at', message: 'Issue date cannot be in the future.' },
    ]);
  });
});
