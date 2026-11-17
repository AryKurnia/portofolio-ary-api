const ListPublishedProjects = require('./ListPublishedProjects');
const GetPublishedProject = require('./GetPublishedProject');
const GetTimeline = require('./GetTimeline');
const ListPublicSocialLinks = require('./ListPublicSocialLinks');
const ListPublishedSkills = require('./ListPublishedSkills');
const GetPortfolio = require('./GetPortfolio');
const Organization = require('../../entities/Organization');
const Position = require('../../entities/Position');
const NotFoundError = require('../../exceptions/NotFoundError');

describe('ListPublishedProjects use-case', () => {
  it('selalu meminta hanya project terbit, dengan default page=1 limit=12', async () => {
    const repo = { findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }) };
    await new ListPublishedProjects(repo).execute();
    expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 12, publishedOnly: true });
  });

  it('meneruskan page dan limit custom', async () => {
    const repo = { findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }) };
    await new ListPublishedProjects(repo).execute({ page: 2, limit: 6 });
    expect(repo.findAll).toHaveBeenCalledWith({ page: 2, limit: 6, publishedOnly: true });
  });

  it('meneruskan error kalau findAll gagal', async () => {
    const repo = { findAll: jest.fn().mockRejectedValue(new Error('DB error')) };
    await expect(new ListPublishedProjects(repo).execute()).rejects.toThrow('DB error');
  });
});

describe('GetPublishedProject use-case', () => {
  it('mengembalikan project yang terbit', async () => {
    const project = { id: 1, isPublished: true };
    const repo = { findById: jest.fn().mockResolvedValue(project) };
    await expect(new GetPublishedProject(repo).execute(1)).resolves.toBe(project);
  });

  it.each([
    ['tidak ada', null],
    ['belum terbit (draf tidak bocor)', { id: 1, isPublished: false }],
  ])('melempar NotFoundError kalau project %s', async (_label, project) => {
    const repo = { findById: jest.fn().mockResolvedValue(project) };
    await expect(new GetPublishedProject(repo).execute(1)).rejects.toThrow(NotFoundError);
  });

  it('meneruskan error kalau findById gagal', async () => {
    const repo = { findById: jest.fn().mockRejectedValue(new Error('DB error')) };
    await expect(new GetPublishedProject(repo).execute(1)).rejects.toThrow('DB error');
  });
});

describe('GetTimeline use-case', () => {
  const position = (attrs) =>
    new Position({ title: 'x', type: 'member', startDate: '2020-01', ...attrs });

  it('mengelompokkan per grup, mengurutkan, dan menyembunyikan organisasi tanpa posisi', async () => {
    // ARRANGE
    const repo = {
      findAll: jest.fn().mockResolvedValue([
        new Organization({
          id: 1,
          name: 'S1',
          group: 'education',
          positions: [position({ type: 'education', startDate: '2021-01' })],
        }),
        new Organization({
          id: 2,
          name: 'S2',
          group: 'education',
          positions: [position({ type: 'education', startDate: '2025-01', isCurrent: true })],
        }),
        new Organization({ id: 3, name: 'Kosong', group: 'work_organization', positions: [] }),
        new Organization({
          id: 4,
          name: 'MAPALA',
          group: 'work_organization',
          positions: [position({})],
        }),
      ]),
    };

    // ACT
    const result = await new GetTimeline(repo).execute();

    // ASSERT
    expect(result.education.map((o) => o.id)).toEqual([2, 1]);
    expect(result.work_organization.map((o) => o.id)).toEqual([4]);
  });

  it('mengembalikan kedua grup walau kosong', async () => {
    const repo = { findAll: jest.fn().mockResolvedValue([]) };
    await expect(new GetTimeline(repo).execute()).resolves.toEqual({
      education: [],
      work_organization: [],
    });
  });

  it('meneruskan error kalau findAll gagal', async () => {
    const repo = { findAll: jest.fn().mockRejectedValue(new Error('DB error')) };
    await expect(new GetTimeline(repo).execute()).rejects.toThrow('DB error');
  });
});

describe('ListPublicSocialLinks use-case', () => {
  it('hanya meminta link yang terbit', async () => {
    const repo = { findAll: jest.fn().mockResolvedValue([]) };
    await new ListPublicSocialLinks(repo).execute();
    expect(repo.findAll).toHaveBeenCalledWith({ publishedOnly: true });
  });

  it('meneruskan error kalau findAll gagal', async () => {
    const repo = { findAll: jest.fn().mockRejectedValue(new Error('DB error')) };
    await expect(new ListPublicSocialLinks(repo).execute()).rejects.toThrow('DB error');
  });
});

describe('ListPublishedSkills use-case', () => {
  it('mengelompokkan skill terbit per kategori (urutan kategori) dan membuang kategori kosong', async () => {
    const deps = {
      skillCategoryRepository: {
        findAll: jest.fn().mockResolvedValue([
          { id: 1, name: 'Frontend' },
          { id: 2, name: 'Backend' },
          { id: 3, name: 'Tools' },
        ]),
      },
      skillRepository: {
        findAll: jest.fn().mockResolvedValue([
          { id: 10, categoryId: 2, name: 'Node.js' },
          { id: 11, categoryId: 1, name: 'HTML5' },
          { id: 12, categoryId: 2, name: 'hapi' },
        ]),
      },
    };

    const result = await new ListPublishedSkills(deps).execute();

    expect(deps.skillRepository.findAll).toHaveBeenCalledWith({ publishedOnly: true });
    expect(result.map((group) => [group.category.name, group.items.map((s) => s.name)])).toEqual([
      ['Frontend', ['HTML5']],
      ['Backend', ['Node.js', 'hapi']],
    ]);
  });
});

describe('GetPortfolio use-case', () => {
  const createDeps = ({ total = 6, items = 6 } = {}) => ({
    getProfile: { execute: jest.fn().mockResolvedValue({ greeting: 'Hi' }) },
    listPublishedSkills: {
      execute: jest.fn().mockResolvedValue([{ category: { id: 1 }, items: [] }]),
    },
    listPublishedProjects: {
      execute: jest.fn().mockResolvedValue({
        data: Array.from({ length: items }, (_, i) => ({ id: i + 1 })),
        meta: { page: 1, limit: 6, total },
      }),
    },
    getTimeline: { execute: jest.fn().mockResolvedValue({ education: [], work_organization: [] }) },
    listPublicSocialLinks: { execute: jest.fn().mockResolvedValue([{ platform: 'github' }]) },
    listPublishedCertificates: { execute: jest.fn().mockResolvedValue([{ id: 1, name: 'CKA' }]) },
  });

  it('menggabungkan semua section dan mengambil 6 project teratas', async () => {
    const deps = createDeps();
    const result = await new GetPortfolio(deps).execute();
    expect(deps.listPublishedProjects.execute).toHaveBeenCalledWith({ page: 1, limit: 6 });
    expect(result).toEqual({
      profile: { greeting: 'Hi' },
      skills: [{ category: { id: 1 }, items: [] }],
      projects: { items: expect.any(Array), total: 6, hasMore: false },
      timeline: { education: [], work_organization: [] },
      socialLinks: [{ platform: 'github' }],
      certificates: [{ id: 1, name: 'CKA' }],
    });
  });

  it('has_more true bila total project lebih dari yang ditampilkan', async () => {
    const result = await new GetPortfolio(createDeps({ total: 9 })).execute();
    expect(result.projects.hasMore).toBe(true);
  });

  it.each([
    'getProfile',
    'listPublishedSkills',
    'listPublishedProjects',
    'getTimeline',
    'listPublicSocialLinks',
    'listPublishedCertificates',
  ])('meneruskan error kalau %s gagal', async (dependency) => {
    const deps = createDeps();
    deps[dependency].execute.mockRejectedValue(new Error(`${dependency} gagal`));
    await expect(new GetPortfolio(deps).execute()).rejects.toThrow(`${dependency} gagal`);
  });
});
