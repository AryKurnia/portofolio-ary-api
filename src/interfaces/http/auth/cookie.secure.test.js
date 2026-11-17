// File terpisah karena config dibaca sekali saat modul dimuat.
process.env.COOKIE_SECURE = 'true';

jest.mock('../../../infrastructure/container', () =>
  require('../../../../test/helpers/http').createContainerMock()
);

const container = require('../../../infrastructure/container');
const { createServer } = require('../../../server');

describe('Cookie refresh_token dengan COOKIE_SECURE=true', () => {
  it('memakai atribut Secure', async () => {
    // ARRANGE
    const server = await createServer();
    container.loginUser.execute.mockResolvedValue({
      accessToken: 'a',
      expiresIn: 900,
      refreshToken: 'r',
      admin: { id: 1, username: 'admin' },
    });

    // ACT
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/admin/auth/login',
      payload: { username: 'admin', password: 'x' },
    });

    // ASSERT
    const cookie = [response.headers['set-cookie']].flat()[0];
    expect(cookie).toContain('Secure');
  });
});
