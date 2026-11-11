jest.mock('../../../infrastructure/container', () =>
  require('../../../../test/helpers/http').createContainerMock()
);

const container = require('../../../infrastructure/container');
const { createServer } = require('../../../server');
const { authHeader } = require('../../../../test/helpers/http');

describe('HTTP routes /api/v1/profile/social-media', () => {
  let server;

  const socialMedia = {
    id: 1,
    platform: 'github',
    url: 'https://github.com/example',
    username: 'example',
    enabled: true,
  };

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /profile/social-media mengembalikan list dalam envelope data', async () => {
    // ARRANGE
    container.listSocialMedia.execute.mockResolvedValue([socialMedia]);

    // ACT
    const response = await server.inject({ method: 'GET', url: '/api/v1/profile/social-media' });

    // ASSERT
    expect(response.statusCode).toBe(200);
    expect(response.result).toEqual({ data: [socialMedia] });
  });

  it('GET /profile/social-media/{platform} mengembalikan 400 untuk platform di luar daftar', async () => {
    // ACT
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/profile/social-media/myspace',
    });

    // ASSERT
    expect(response.statusCode).toBe(400);
    expect(response.result.error.details[0].field).toBe('platform');
    expect(container.getSocialMediaByPlatform.execute).not.toHaveBeenCalled();
  });

  it('PUT /profile/social-media/{platform} hanya meneruskan field yang dikirim', async () => {
    // ARRANGE
    container.updateSocialMedia.execute.mockResolvedValue(socialMedia);

    // ACT
    const response = await server.inject({
      method: 'PUT',
      url: '/api/v1/profile/social-media/github',
      headers: authHeader(),
      payload: { url: 'https://github.com/baru' },
    });

    // ASSERT
    expect(response.statusCode).toBe(200);
    expect(container.updateSocialMedia.execute).toHaveBeenCalledWith('github', {
      url: 'https://github.com/baru',
      username: undefined,
      enabled: undefined,
    });
  });

  it('PUT /profile/social-media/{platform} mengembalikan 401 tanpa token', async () => {
    // ACT
    const response = await server.inject({
      method: 'PUT',
      url: '/api/v1/profile/social-media/github',
      payload: { url: 'https://github.com/baru' },
    });

    // ASSERT
    expect(response.statusCode).toBe(401);
    expect(container.updateSocialMedia.execute).not.toHaveBeenCalled();
  });
});
