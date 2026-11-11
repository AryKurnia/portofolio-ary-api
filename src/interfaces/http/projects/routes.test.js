jest.mock('../../../infrastructure/container', () =>
  require('../../../../test/helpers/http').createContainerMock()
);

const container = require('../../../infrastructure/container');
const { createServer } = require('../../../server');
const { authHeader } = require('../../../../test/helpers/http');

describe('HTTP routes /api/v1/admin/projects', () => {
  let server;
  const project = {
    id: 1,
    title: 'FitAI',
    description: 'x',
    imageMediaId: 7,
    linkUrl: 'https://fit.ai',
    showButton: true,
    isPublished: true,
    sortOrder: 1,
    createdAt: new Date('2026-11-11T00:00:00Z'),
    updatedAt: new Date('2026-11-11T00:00:00Z'),
  };
  const inject = (method, url, payload) =>
    server.inject({ method, url: `/api/v1/admin${url}`, headers: authHeader(), payload });

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('GET memakai default page=1, limit=12 dan mengembalikan snake_case', async () => {
    container.listProjects.execute.mockResolvedValue({
      data: [project],
      meta: { page: 1, limit: 12, total: 1 },
    });
    const response = await inject('GET', '/projects');
    expect(container.listProjects.execute).toHaveBeenCalledWith({ page: 1, limit: 12 });
    expect(response.result.data[0]).toEqual(
      expect.objectContaining({
        image_id: 7,
        link_url: 'https://fit.ai',
        show_button: true,
        is_published: true,
      })
    );
  });

  it('GET menolak limit di atas 50', async () => {
    expect((await inject('GET', '/projects?limit=51')).statusCode).toBe(400);
  });

  it('POST menerjemahkan payload ke camelCase; field yang tidak dikirim tetap undefined', async () => {
    container.createProject.execute.mockResolvedValue(project);
    const response = await inject('POST', '/projects', {
      title: 'FitAI',
      description: 'x',
      image_id: 7,
    });
    expect(response.statusCode).toBe(201);
    expect(container.createProject.execute).toHaveBeenCalledWith({
      title: 'FitAI',
      description: 'x',
      imageMediaId: 7,
      linkUrl: undefined,
      showButton: undefined,
      isPublished: undefined,
    });
  });

  it.each([
    ['http:', 'http://fit.ai'],
    ['javascript:', 'javascript:alert(1)'],
  ])('POST menolak link_url dengan skema %s', async (_label, linkUrl) => {
    const response = await inject('POST', '/projects', {
      title: 'a',
      description: 'b',
      link_url: linkUrl,
    });
    expect(response.statusCode).toBe(400);
    expect(response.result.error.details[0].field).toBe('link_url');
  });

  it('PATCH /projects/reorder tidak tertangkap sebagai /projects/{id}', async () => {
    container.reorderProjects.execute.mockResolvedValue(undefined);
    const response = await inject('PATCH', '/projects/reorder', { ids: [2, 1] });
    expect(response.statusCode).toBe(204);
    expect(container.reorderProjects.execute).toHaveBeenCalledWith([2, 1]);
    expect(container.updateProject.execute).not.toHaveBeenCalled();
  });

  it('PATCH /projects/{id} menolak payload kosong', async () => {
    expect((await inject('PATCH', '/projects/1', {})).statusCode).toBe(400);
  });

  it('butuh token admin', async () => {
    const response = await server.inject({ method: 'GET', url: '/api/v1/admin/projects' });
    expect(response.statusCode).toBe(401);
  });
});
