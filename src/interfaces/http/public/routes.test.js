jest.mock('../../../infrastructure/container', () =>
  require('../../../../test/helpers/http').createContainerMock()
);

const container = require('../../../infrastructure/container');
const { createServer } = require('../../../server');
const NotFoundError = require('../../../exceptions/NotFoundError');

describe('HTTP routes publik /api/v1', () => {
  let server;
  const profile = {
    greeting: "Hi, I'm Ary",
    tagline: 'dev',
    about: 'Tentang',
    projectIntro: 'Intro',
    email: 'admin@example.com',
    photoMediaId: 3,
    updatedAt: new Date(),
  };
  const project = {
    id: 1,
    title: 'FitAI',
    description: 'x',
    imageMediaId: 7,
    linkUrl: 'https://fit.ai',
    showButton: true,
    isPublished: true,
    sortOrder: 1,
  };
  const position = {
    id: 5,
    organizationId: 1,
    title: 'Sekretaris Umum',
    type: 'board',
    eventName: null,
    startDate: '2023-01',
    endDate: '2025-01',
    isCurrent: false,
    description: null,
    sortOrder: 2,
  };
  const timeline = {
    education: [],
    work_organization: [
      {
        id: 1,
        name: 'MAPALA',
        group: 'work_organization',
        location: null,
        sortOrder: 3,
        positions: [position],
      },
    ],
  };
  const get = (url, headers = {}) =>
    server.inject({ method: 'GET', url: `/api/v1${url}`, headers });

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('tidak butuh token dan mengirim Cache-Control publik + ETag', async () => {
    container.getProfile.execute.mockResolvedValue(profile);
    const response = await get('/profile');
    expect(response.statusCode).toBe(200);
    expect(response.headers['cache-control']).toBe(
      'public, max-age=60, stale-while-revalidate=300'
    );
    expect(response.headers.etag).toBeDefined();
  });

  it('membalas 304 tanpa body bila If-None-Match cocok', async () => {
    container.getProfile.execute.mockResolvedValue(profile);
    const first = await get('/profile');
    const second = await get('/profile', { 'if-none-match': first.headers.etag });
    expect(second.statusCode).toBe(304);
    expect(second.payload).toBe('');
  });

  it('ETag berubah bila isinya berubah', async () => {
    container.getProfile.execute.mockResolvedValueOnce(profile);
    const first = await get('/profile');
    container.getProfile.execute.mockResolvedValueOnce({ ...profile, tagline: 'baru' });
    const second = await get('/profile', { 'if-none-match': first.headers.etag });
    expect(second.statusCode).toBe(200);
    expect(second.headers.etag).not.toBe(first.headers.etag);
  });

  it('profile publik tidak memuat data admin (photo_media_id, updated_at)', async () => {
    container.getProfile.execute.mockResolvedValue(profile);
    const response = await get('/profile');
    expect(Object.keys(response.result.data).sort()).toEqual([
      'about',
      'email',
      'greeting',
      'photo',
      'project_intro',
      'tagline',
    ]);
  });

  it('project publik tidak memuat is_published, sort_order, atau image_id', async () => {
    container.listPublishedProjects.execute.mockResolvedValue({
      data: [project],
      meta: { page: 1, limit: 12, total: 1 },
    });
    const response = await get('/projects');
    expect(response.result.data[0]).toEqual({
      id: 1,
      title: 'FitAI',
      description: 'x',
      image: null,
      link_url: 'https://fit.ai',
      show_button: true,
    });
  });

  it('gambar project berisi URL utama + URL tiap varian, dibangun dari object key', async () => {
    container.listPublishedProjects.execute.mockResolvedValue({
      data: [
        {
          ...project,
          image: {
            id: 7,
            objectKey: 'project_image/u-800.webp',
            mime: 'image/webp',
            width: 1600,
            height: 900,
            variants: { 400: 'project_image/u-400.webp', 800: 'project_image/u-800.webp' },
          },
        },
      ],
      meta: { page: 1, limit: 12, total: 1 },
    });
    const response = await get('/projects');
    expect(response.result.data[0].image).toEqual({
      id: 7,
      url: 'https://cdn.test/project_image/u-800.webp',
      width: 1600,
      height: 900,
      mime: 'image/webp',
      variants: {
        400: 'https://cdn.test/project_image/u-400.webp',
        800: 'https://cdn.test/project_image/u-800.webp',
      },
    });
  });

  it('project yang tidak terbit → 404 dan tidak di-cache publik', async () => {
    container.getPublishedProject.execute.mockRejectedValue(
      new NotFoundError('Project with id 2 was not found.')
    );
    const response = await get('/projects/2');
    expect(response.statusCode).toBe(404);
    expect(response.headers['cache-control']).not.toContain('public');
  });

  it('timeline dikelompokkan per grup dengan label, tanpa field admin', async () => {
    container.getTimeline.execute.mockResolvedValue(timeline);
    const response = await get('/timeline');
    const [organization] = response.result.data.work_organization;
    expect(response.result.data.education).toEqual([]);
    expect(organization).not.toHaveProperty('sort_order');
    expect(organization.positions[0]).toEqual(
      expect.objectContaining({
        title: 'Sekretaris Umum',
        type_label: 'Board',
        period_label: '2023 – 2025',
      })
    );
    expect(organization.positions[0]).not.toHaveProperty('organization_id');
  });

  it('social links memakai label kustom bila ada, selain itu label dari platform', async () => {
    container.listPublicSocialLinks.execute.mockResolvedValue([
      {
        id: 1,
        platform: 'github',
        label: null,
        url: 'https://github.com/x',
        isPublished: true,
        sortOrder: 1,
      },
      {
        id: 2,
        platform: 'x',
        label: null,
        url: 'https://x.com/x',
        isPublished: true,
        sortOrder: 2,
      },
      {
        id: 3,
        platform: 'other',
        label: 'Blog',
        url: 'https://blog.example',
        isPublished: true,
        sortOrder: 3,
      },
    ]);
    const response = await get('/social-links');
    expect(response.result.data).toEqual([
      { platform: 'github', label: 'GitHub', url: 'https://github.com/x' },
      { platform: 'x', label: 'X', url: 'https://x.com/x' },
      { platform: 'other', label: 'Blog', url: 'https://blog.example' },
    ]);
  });

  it('skills dikelompokkan per kategori tanpa field admin', async () => {
    container.listPublishedSkills.execute.mockResolvedValue([
      {
        category: { id: 2, name: 'Backend', sortOrder: 2 },
        items: [
          { id: 10, categoryId: 2, name: 'Node.js', logo: null, isPublished: true, sortOrder: 1 },
        ],
      },
    ]);
    const response = await get('/skills');
    expect(response.result.data).toEqual([
      { category: { id: 2, name: 'Backend' }, items: [{ id: 10, name: 'Node.js', logo: null }] },
    ]);
  });

  it('portfolio menggabungkan semua section dalam snake_case', async () => {
    container.getPortfolio.execute.mockResolvedValue({
      profile,
      skills: [],
      projects: { items: [project], total: 7, hasMore: true },
      timeline,
      socialLinks: [{ platform: 'github', label: null, url: 'https://github.com/x' }],
    });
    const response = await get('/portfolio');
    expect(Object.keys(response.result.data).sort()).toEqual([
      'profile',
      'projects',
      'skills',
      'social_links',
      'timeline',
    ]);
    expect(response.result.data.projects).toEqual(
      expect.objectContaining({ total: 7, has_more: true })
    );
  });
});
