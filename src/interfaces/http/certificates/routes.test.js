jest.mock('../../../infrastructure/container', () =>
  require('../../../../test/helpers/http').createContainerMock()
);

const container = require('../../../infrastructure/container');
const { createServer } = require('../../../server');
const { authHeader } = require('../../../../test/helpers/http');
const ValidationError = require('../../../exceptions/ValidationError');

describe('HTTP routes /api/v1/admin/certificates', () => {
  let server;
  const certificate = {
    id: 1,
    name: 'CKA',
    issuer: 'CNCF',
    issuedAt: '2025-03',
    expiresAt: '2028-03',
    credentialId: null,
    credentialUrl: 'https://verify.example/1',
    fileMediaId: null,
    file: null,
    isPublished: false,
    sortOrder: 1,
    createdAt: new Date('2026-11-12T00:00:00Z'),
    updatedAt: new Date('2026-11-12T00:00:00Z'),
  };
  const valid = { name: 'CKA', issuer: 'CNCF', issued_at: '2025-03' };
  const inject = (method, url, payload, headers = authHeader()) =>
    server.inject({ method, url: `/api/v1/admin${url}`, headers, payload });

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('GET mengembalikan semua sertifikat dalam snake_case (termasuk draf)', async () => {
    container.listCertificates.execute.mockResolvedValue([certificate]);
    const response = await inject('GET', '/certificates');
    expect(response.statusCode).toBe(200);
    expect(response.result.data[0]).toEqual({
      id: 1,
      name: 'CKA',
      issuer: 'CNCF',
      issued_at: '2025-03',
      expires_at: '2028-03',
      credential_id: null,
      credential_url: 'https://verify.example/1',
      file_id: null,
      file: null,
      is_published: false,
      sort_order: 1,
      created_at: certificate.createdAt,
      updated_at: certificate.updatedAt,
    });
  });

  it('POST memetakan payload ke input use-case dan membalas 201', async () => {
    container.createCertificate.execute.mockResolvedValue(certificate);
    const response = await inject('POST', '/certificates', {
      ...valid,
      expires_at: null,
      file_id: 8,
      is_published: true,
    });
    expect(response.statusCode).toBe(201);
    expect(container.createCertificate.execute).toHaveBeenCalledWith({
      name: 'CKA',
      issuer: 'CNCF',
      issuedAt: '2025-03',
      expiresAt: null,
      credentialId: undefined,
      credentialUrl: undefined,
      fileMediaId: 8,
      isPublished: true,
    });
  });

  it('POST tanpa name & issuer → pesan sama dengan desain', async () => {
    const response = await inject('POST', '/certificates', { issued_at: '2025-03' });
    expect(response.statusCode).toBe(400);
    expect(response.result.error.details).toEqual([
      { field: 'name', message: 'This field is required.' },
      { field: 'issuer', message: 'This field is required.' },
    ]);
  });

  it.each([
    ['credential_url http', { credential_url: 'http://verify.example/1' }, 'credential_url'],
    ['credential_url javascript:', { credential_url: 'javascript:alert(1)' }, 'credential_url'],
    ['issued_at bukan YYYY-MM', { issued_at: '2025-3' }, 'issued_at'],
    ['name berisi HTML', { name: '<b>x</b>' }, 'name'],
    ['name > 150 karakter', { name: 'x'.repeat(151) }, 'name'],
    ['credential_id > 100 karakter', { credential_id: 'x'.repeat(101) }, 'credential_id'],
  ])('POST menolak %s', async (_label, override, field) => {
    const response = await inject('POST', '/certificates', { ...valid, ...override });
    expect(response.statusCode).toBe(400);
    expect(response.result.error.details.map((d) => d.field)).toEqual([field]);
    expect(container.createCertificate.execute).not.toHaveBeenCalled();
  });

  it('credential_url http ditolak dengan pesan "Enter a valid URL."', async () => {
    const response = await inject('POST', '/certificates', {
      ...valid,
      credential_url: 'ftp://x.y',
    });
    expect(response.result.error.details[0].message).toBe('Enter a valid URL.');
  });

  it('aturan use-case (kedaluwarsa, terbit) dibalas 400 dengan details', async () => {
    container.createCertificate.execute.mockRejectedValue(
      new ValidationError('Some fields are invalid.', [
        { field: 'file_id', message: 'Add a file or a credential URL to publish.' },
      ])
    );
    const response = await inject('POST', '/certificates', { ...valid, is_published: true });
    expect(response.statusCode).toBe(400);
    expect(response.result.error).toEqual({
      code: 'VALIDATION_ERROR',
      message: 'Some fields are invalid.',
      details: [{ field: 'file_id', message: 'Add a file or a credential URL to publish.' }],
    });
  });

  it('PATCH parsial; body kosong ditolak', async () => {
    container.updateCertificate.execute.mockResolvedValue(certificate);
    expect((await inject('PATCH', '/certificates/1', { expires_at: null })).statusCode).toBe(200);
    expect(container.updateCertificate.execute).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ expiresAt: null, name: undefined })
    );
    expect((await inject('PATCH', '/certificates/1', {})).statusCode).toBe(400);
  });

  it('PATCH /certificates/reorder tidak tertangkap sebagai /certificates/{id}', async () => {
    container.reorderCertificates.execute.mockResolvedValue(undefined);
    const response = await inject('PATCH', '/certificates/reorder', { ids: [2, 1] });
    expect(response.statusCode).toBe(204);
    expect(container.reorderCertificates.execute).toHaveBeenCalledWith([2, 1]);
    expect(container.updateCertificate.execute).not.toHaveBeenCalled();
  });

  it('DELETE → 204', async () => {
    container.deleteCertificate.execute.mockResolvedValue(undefined);
    expect((await inject('DELETE', '/certificates/1')).statusCode).toBe(204);
  });

  it.each([
    ['GET', '/certificates'],
    ['POST', '/certificates'],
    ['PATCH', '/certificates/1'],
    ['DELETE', '/certificates/1'],
    ['PATCH', '/certificates/reorder'],
  ])('%s %s butuh token admin', async (method, url) => {
    expect((await inject(method, url, valid, {})).statusCode).toBe(401);
  });
});
