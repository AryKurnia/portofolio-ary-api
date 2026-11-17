// File terpisah karena config dibaca sekali saat modul dimuat; env CORS diubah sebelum require.
process.env.CORS_ORIGINS = 'https://arykurnia.example, https://admin.arykurnia.example';

jest.mock('./infrastructure/container', () =>
  require('../test/helpers/http').createContainerMock()
);

const container = require('./infrastructure/container');
const { createServer } = require('./server');

describe('createServer — CORS_ORIGINS terisi', () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
    container.checkHealth.execute.mockResolvedValue({ status: 'ok', database: 'ok' });
  });

  it('mengizinkan origin yang terdaftar', async () => {
    // ACT
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: { origin: 'https://admin.arykurnia.example' },
    });

    // ASSERT
    expect(response.headers['access-control-allow-origin']).toBe('https://admin.arykurnia.example');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('tidak mengizinkan origin yang tidak terdaftar', async () => {
    // ACT
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: { origin: 'https://situs-jahat.example' },
    });

    // ASSERT
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
