jest.mock('../../../infrastructure/container', () =>
  require('../../../../test/helpers/http').createContainerMock()
);

const container = require('../../../infrastructure/container');
const { createServer } = require('../../../server');
const { authHeader } = require('../../../../test/helpers/http');

describe('HTTP routes /api/v1/admin/skill-categories', () => {
  let server;
  const inject = (method, url, payload) =>
    server.inject({ method, url: `/api/v1/admin${url}`, headers: authHeader(), payload });

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('GET mengembalikan kategori dengan sort_order dan skill_count', async () => {
    container.listSkillCategories.execute.mockResolvedValue([
      { id: 1, name: 'Frontend', sortOrder: 1, skillCount: 3 },
    ]);
    const response = await inject('GET', '/skill-categories');
    expect(response.result).toEqual({
      data: [{ id: 1, name: 'Frontend', sort_order: 1, skill_count: 3 }],
    });
  });

  it('POST menolak nama kosong, terlalu panjang, atau berisi HTML', async () => {
    for (const name of ['', 'x'.repeat(41), '<b>Tools</b>']) {
      expect((await inject('POST', '/skill-categories', { name })).statusCode).toBe(400);
    }
    expect(container.createSkillCategory.execute).not.toHaveBeenCalled();
  });

  it('PATCH /skill-categories/reorder tidak tertangkap sebagai /skill-categories/{id}', async () => {
    container.reorderSkillCategories.execute.mockResolvedValue(undefined);
    const response = await inject('PATCH', '/skill-categories/reorder', { ids: [2, 1] });
    expect(response.statusCode).toBe(204);
    expect(container.updateSkillCategory.execute).not.toHaveBeenCalled();
  });
});
