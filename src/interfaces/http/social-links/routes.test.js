jest.mock('../../../infrastructure/container', () =>
  require('../../../../test/helpers/http').createContainerMock()
);

const container = require('../../../infrastructure/container');
const { createServer } = require('../../../server');
const { authHeader } = require('../../../../test/helpers/http');

describe('HTTP routes /api/v1/admin/social-links', () => {
  let server;
  const link = {
    id: 1,
    platform: 'github',
    label: null,
    url: 'https://github.com/a',
    isPublished: true,
    sortOrder: 1,
  };
  const inject = (method, url, payload) =>
    server.inject({ method, url: `/api/v1/admin${url}`, headers: authHeader(), payload });

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('GET berisi label kustom (nullable) dan display_label', async () => {
    container.listSocialLinks.execute.mockResolvedValue([link]);
    const response = await inject('GET', '/social-links');
    expect(response.result.data[0]).toEqual({
      id: 1,
      platform: 'github',
      label: null,
      display_label: 'GitHub',
      url: 'https://github.com/a',
      is_published: true,
      sort_order: 1,
    });
  });

  it.each([
    ['platform tidak dikenal', { platform: 'myspace', url: 'https://myspace.com/a' }],
    ['url bukan https', { platform: 'github', url: 'http://github.com/a' }],
    ['tanpa url', { platform: 'github' }],
    ['label berisi HTML', { platform: 'other', url: 'https://a.b', label: '<b>x</b>' }],
  ])('POST menolak %s', async (_label, payload) => {
    expect((await inject('POST', '/social-links', payload)).statusCode).toBe(400);
    expect(container.createSocialLink.execute).not.toHaveBeenCalled();
  });

  it('pesan validasi seragam untuk field wajib dan URL (teks sama dengan desain)', async () => {
    const missing = await inject('POST', '/social-links', { platform: 'github' });
    expect(missing.result.error.details).toEqual([
      { field: 'url', message: 'This field is required.' },
    ]);
    const empty = await inject('POST', '/social-links', { platform: 'github', url: '' });
    expect(empty.result.error.details[0].message).toBe('This field is required.');
    const http = await inject('POST', '/social-links', { platform: 'github', url: 'http://a.b' });
    expect(http.result.error.details[0].message).toBe('Enter a valid URL.');
  });

  it('PATCH /social-links/reorder tidak tertangkap sebagai /social-links/{id}', async () => {
    container.reorderSocialLinks.execute.mockResolvedValue(undefined);
    const response = await inject('PATCH', '/social-links/reorder', { ids: [2, 1] });
    expect(response.statusCode).toBe(204);
    expect(container.updateSocialLink.execute).not.toHaveBeenCalled();
  });

  it('endpoint lama /profile/social-media tidak ada lagi', async () => {
    const response = await server.inject({ method: 'GET', url: '/api/v1/profile/social-media' });
    expect(response.statusCode).toBe(404);
  });
});
