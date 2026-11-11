jest.mock('../../../infrastructure/container', () =>
  require('../../../../test/helpers/http').createContainerMock()
);

const container = require('../../../infrastructure/container');
const { createServer } = require('../../../server');

describe('HTTP routes /api/v1/health', () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  it('GET /health mengembalikan 200 kalau semua komponen sehat', async () => {
    // ARRANGE
    container.checkHealth.execute.mockResolvedValue({ status: 'ok', database: 'ok' });

    // ACT
    const response = await server.inject({ method: 'GET', url: '/api/v1/health' });

    // ASSERT
    expect(response.statusCode).toBe(200);
    expect(response.result).toEqual({ data: { status: 'ok', database: 'ok' } });
  });

  it('GET /health mengembalikan 503 kalau database tidak bisa dijangkau', async () => {
    // ARRANGE
    container.checkHealth.execute.mockResolvedValue({ status: 'error', database: 'unreachable' });

    // ACT
    const response = await server.inject({ method: 'GET', url: '/api/v1/health' });

    // ASSERT
    expect(response.statusCode).toBe(503);
    expect(response.result.data.database).toBe('unreachable');
  });
});
