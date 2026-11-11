jest.mock('../../../infrastructure/container', () =>
  require('../../../../test/helpers/http').createContainerMock()
);

const container = require('../../../infrastructure/container');
const { createServer } = require('../../../server');
const AuthenticationError = require('../../../exceptions/AuthenticationError');

describe('HTTP routes /api/v1/auth', () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /auth/login mengembalikan access_token dan expires_in (snake_case)', async () => {
    // ARRANGE
    container.loginUser.execute.mockResolvedValue({ accessToken: 'token-palsu', expiresIn: 3600 });

    // ACT
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'admin@example.com', password: 'rahasia' },
    });

    // ASSERT
    expect(response.statusCode).toBe(200);
    expect(container.loginUser.execute).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'rahasia',
    });
    expect(response.result).toEqual({ data: { access_token: 'token-palsu', expires_in: 3600 } });
  });

  it('POST /auth/login mengembalikan 401 INVALID_CREDENTIALS kalau kredensial salah', async () => {
    // ARRANGE
    container.loginUser.execute.mockRejectedValue(
      new AuthenticationError('Invalid email or password.')
    );

    // ACT
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'admin@example.com', password: 'salah' },
    });

    // ASSERT
    expect(response.statusCode).toBe(401);
    expect(response.result).toEqual({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
    });
  });

  it('POST /auth/login mengembalikan 400 dengan detail field kalau email tidak valid', async () => {
    // ACT
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'bukan-email' },
    });

    // ASSERT
    expect(response.statusCode).toBe(400);
    const fields = response.result.error.details.map((detail) => detail.field);
    expect(fields).toEqual(expect.arrayContaining(['email', 'password']));
    expect(container.loginUser.execute).not.toHaveBeenCalled();
  });
});
