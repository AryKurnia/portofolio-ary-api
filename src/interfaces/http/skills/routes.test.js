jest.mock('../../../infrastructure/container', () =>
  require('../../../../test/helpers/http').createContainerMock()
);

const container = require('../../../infrastructure/container');
const { createServer } = require('../../../server');
const { authHeader } = require('../../../../test/helpers/http');

describe('HTTP routes /api/v1/admin/skills', () => {
  let server;
  const skill = {
    id: 1,
    categoryId: 2,
    name: 'Node.js',
    logoMediaId: 5,
    isPublished: true,
    sortOrder: 1,
    logo: {
      id: 5,
      objectKey: 'skill_logo/u.svg',
      mime: 'image/svg+xml',
      width: 64,
      height: 64,
      variants: { original: 'skill_logo/u.svg' },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const inject = (method, url, payload) =>
    server.inject({ method, url: `/api/v1/admin${url}`, headers: authHeader(), payload });

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('GET meneruskan filter category_id dan mengembalikan logo dengan URL', async () => {
    container.listSkills.execute.mockResolvedValue([skill]);
    const response = await inject('GET', '/skills?category_id=2');
    expect(container.listSkills.execute).toHaveBeenCalledWith({ categoryId: 2 });
    expect(response.result.data[0]).toEqual(
      expect.objectContaining({
        category_id: 2,
        logo_id: 5,
        logo: expect.objectContaining({ url: 'https://cdn.test/skill_logo/u.svg' }),
      })
    );
  });

  it('POST menerjemahkan payload ke camelCase', async () => {
    container.createSkill.execute.mockResolvedValue(skill);
    const response = await inject('POST', '/skills', {
      category_id: 2,
      name: 'Node.js',
      logo_id: 5,
    });
    expect(response.statusCode).toBe(201);
    expect(container.createSkill.execute).toHaveBeenCalledWith({
      categoryId: 2,
      name: 'Node.js',
      logoMediaId: 5,
      isPublished: undefined,
    });
  });

  it('POST menolak tanpa category_id atau nama > 40 karakter', async () => {
    expect((await inject('POST', '/skills', { name: 'x' })).statusCode).toBe(400);
    expect(
      (await inject('POST', '/skills', { category_id: 1, name: 'x'.repeat(41) })).statusCode
    ).toBe(400);
    expect(container.createSkill.execute).not.toHaveBeenCalled();
  });

  it('PATCH /skills/reorder wajib category_id dan tidak tertangkap sebagai /skills/{id}', async () => {
    container.reorderSkills.execute.mockResolvedValue(undefined);
    expect((await inject('PATCH', '/skills/reorder', { ids: [2, 1] })).statusCode).toBe(400);
    const response = await inject('PATCH', '/skills/reorder', { category_id: 2, ids: [2, 1] });
    expect(response.statusCode).toBe(204);
    expect(container.reorderSkills.execute).toHaveBeenCalledWith(2, [2, 1]);
    expect(container.updateSkill.execute).not.toHaveBeenCalled();
  });

  it('endpoint lama tidak ada lagi (POST /skills publik, upload logo lama)', async () => {
    const oldCreate = await server.inject({
      method: 'POST',
      url: '/api/v1/skills',
      headers: authHeader(),
      payload: { name: 'x' },
    });
    const oldLogo = await server.inject({
      method: 'POST',
      url: '/api/v1/skills/1/logo',
      headers: authHeader(),
    });
    expect(oldCreate.statusCode).toBe(404);
    expect(oldLogo.statusCode).toBe(404);
  });
});
