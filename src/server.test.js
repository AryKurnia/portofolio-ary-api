jest.mock('./infrastructure/container', () =>
  require('../test/helpers/http').createContainerMock()
);

const container = require('./infrastructure/container');
const { createServer } = require('./server');

describe('createServer — perilaku lintas route', () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('route yang tidak ada mengembalikan 404 NOT_FOUND dengan format error standar', async () => {
    // ACT
    const response = await server.inject({ method: 'GET', url: '/api/v1/tidak-ada' });

    // ASSERT
    expect(response.statusCode).toBe(404);
    expect(response.result).toEqual({
      error: { code: 'NOT_FOUND', message: 'Resource not found.' },
    });
  });

  it('path lama tanpa prefix /api/v1 tidak lagi tersedia', async () => {
    // ACT
    const response = await server.inject({ method: 'GET', url: '/profile' });

    // ASSERT
    expect(response.statusCode).toBe(404);
    expect(container.getProfile.execute).not.toHaveBeenCalled();
  });

  it('error tak terduga dibalas 500 INTERNAL_ERROR tanpa membocorkan pesan aslinya', async () => {
    // ARRANGE
    container.getProfile.execute.mockRejectedValue(new Error('ER_ACCESS_DENIED db-user@10.0.0.5'));

    // ACT
    const response = await server.inject({ method: 'GET', url: '/api/v1/profile' });

    // ASSERT
    expect(response.statusCode).toBe(500);
    expect(response.result.error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(response.result)).not.toContain('10.0.0.5');
  });

  it('mengirim header keamanan pada respons', async () => {
    // ARRANGE
    container.checkHealth.execute.mockResolvedValue({ status: 'ok', database: 'ok' });

    // ACT
    const response = await server.inject({ method: 'GET', url: '/api/v1/health' });

    // ASSERT
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['strict-transport-security']).toBeDefined();
  });

  it('tidak mengirim header CORS kalau CORS_ORIGINS kosong', async () => {
    // ARRANGE
    container.checkHealth.execute.mockResolvedValue({ status: 'ok', database: 'ok' });

    // ACT
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: { origin: 'https://situs-lain.example' },
    });

    // ASSERT
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
