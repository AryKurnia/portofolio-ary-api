// Tes kontrak: docs/openapi.yaml harus selalu sesuai dengan route dan respons sebenarnya.
// Menambah endpoint/status baru tanpa memperbarui openapi.yaml (atau sebaliknya) membuat tes ini gagal.
jest.mock('../../src/infrastructure/container', () =>
  require('../helpers/http').createContainerMock()
);

const container = require('../../src/infrastructure/container');
const { createServer, API_PREFIX } = require('../../src/server');
const { authHeader } = require('../helpers/http');
const {
  listOperations,
  listDocumentedResponses,
  assertMatchesSpec,
} = require('../helpers/openapi');
const NotFoundError = require('../../src/exceptions/NotFoundError');
const AuthenticationError = require('../../src/exceptions/AuthenticationError');
const UnauthorizedError = require('../../src/exceptions/UnauthorizedError');

const skill = {
  id: 1,
  name: 'Node.js',
  logoUrl: null,
  description: 'Runtime JavaScript',
  enabled: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-02T00:00:00Z'),
};
const socialMedia = {
  id: 1,
  platform: 'github',
  url: 'https://github.com/example',
  username: 'example',
  enabled: true,
};
const notFound = () => Promise.reject(new NotFoundError('Resource was not found.'));

const multipart = (type, sizeBytes = 10) => {
  const boundary = 'batas-kontrak';
  return {
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    payload: Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="logo"; filename="f"\r\n` +
          `Content-Type: ${type}\r\n\r\n`
      ),
      Buffer.alloc(sizeBytes, 'a'),
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]),
  };
};

// [method, routePath (sesuai openapi), url, opsi inject, setup mock]
const scenarios = [
  [
    'GET',
    '/health',
    '/health',
    {},
    () => container.checkHealth.execute.mockResolvedValue({ status: 'ok', database: 'ok' }),
  ],
  [
    'GET',
    '/health',
    '/health',
    {},
    () =>
      container.checkHealth.execute.mockResolvedValue({ status: 'error', database: 'unreachable' }),
  ],

  [
    'POST',
    '/admin/auth/login',
    '/admin/auth/login',
    { payload: { username: 'admin', password: 'x' } },
    () =>
      container.loginUser.execute.mockResolvedValue({
        accessToken: 't',
        expiresIn: 900,
        refreshToken: 'r',
        admin: { id: 1, username: 'admin' },
      }),
  ],
  ['POST', '/admin/auth/login', '/admin/auth/login', { payload: { username: 'admin' } }],
  [
    'POST',
    '/admin/auth/login',
    '/admin/auth/login',
    { payload: { username: 'admin', password: 'x' } },
    () =>
      container.loginUser.execute.mockRejectedValue(
        new AuthenticationError('Invalid username or password.')
      ),
  ],
  [
    'POST',
    '/admin/auth/refresh',
    '/admin/auth/refresh',
    { headers: { cookie: 'refresh_token=r' } },
    () =>
      container.refreshAccessToken.execute.mockResolvedValue({
        accessToken: 't',
        expiresIn: 900,
        refreshToken: 'r2',
      }),
  ],
  [
    'POST',
    '/admin/auth/refresh',
    '/admin/auth/refresh',
    {},
    () =>
      container.refreshAccessToken.execute.mockRejectedValue(
        new UnauthorizedError('Missing refresh token.')
      ),
  ],
  [
    'POST',
    '/admin/auth/logout',
    '/admin/auth/logout',
    { headers: { cookie: 'refresh_token=r' } },
    () => container.logoutUser.execute.mockResolvedValue(undefined),
  ],
  [
    'GET',
    '/admin/auth/me',
    '/admin/auth/me',
    { auth: true },
    () => container.getCurrentAdmin.execute.mockResolvedValue({ id: 1, username: 'admin' }),
  ],
  ['GET', '/admin/auth/me', '/admin/auth/me', {}],
  [
    'GET',
    '/skills',
    '/skills',
    {},
    () =>
      container.listSkills.execute.mockResolvedValue({
        data: [skill],
        meta: { page: 1, limit: 10, total: 1 },
      }),
  ],
  ['GET', '/skills', '/skills?limit=1000', {}],
  [
    'POST',
    '/skills',
    '/skills',
    { auth: true, payload: { name: 'Node.js' } },
    () => container.createSkill.execute.mockResolvedValue(skill),
  ],
  ['POST', '/skills', '/skills', { auth: true, payload: {} }],
  ['POST', '/skills', '/skills', { payload: { name: 'Node.js' } }],

  [
    'GET',
    '/skills/{id}',
    '/skills/1',
    {},
    () => container.getSkill.execute.mockResolvedValue(skill),
  ],
  ['GET', '/skills/{id}', '/skills/abc', {}],
  [
    'GET',
    '/skills/{id}',
    '/skills/99',
    {},
    () => container.getSkill.execute.mockImplementation(notFound),
  ],
  [
    'PUT',
    '/skills/{id}',
    '/skills/1',
    { auth: true, payload: { name: 'A', description: null, enabled: true } },
    () => container.updateSkill.execute.mockResolvedValue(skill),
  ],
  ['PUT', '/skills/{id}', '/skills/1', { auth: true, payload: { name: 'A' } }],
  [
    'PUT',
    '/skills/{id}',
    '/skills/1',
    { payload: { name: 'A', description: null, enabled: true } },
  ],
  [
    'PUT',
    '/skills/{id}',
    '/skills/99',
    { auth: true, payload: { name: 'A', description: null, enabled: true } },
    () => container.updateSkill.execute.mockImplementation(notFound),
  ],
  [
    'DELETE',
    '/skills/{id}',
    '/skills/1',
    { auth: true },
    () => container.deleteSkill.execute.mockResolvedValue(undefined),
  ],
  ['DELETE', '/skills/{id}', '/skills/abc', { auth: true }],
  ['DELETE', '/skills/{id}', '/skills/1', {}],
  [
    'DELETE',
    '/skills/{id}',
    '/skills/99',
    { auth: true },
    () => container.deleteSkill.execute.mockImplementation(notFound),
  ],

  [
    'POST',
    '/skills/{id}/logo',
    '/skills/1/logo',
    { auth: true, ...multipart('image/png') },
    () => container.uploadSkillLogo.execute.mockResolvedValue(skill),
  ],
  ['POST', '/skills/{id}/logo', '/skills/abc/logo', { auth: true, ...multipart('image/png') }],
  ['POST', '/skills/{id}/logo', '/skills/1/logo', multipart('image/png')],
  [
    'POST',
    '/skills/{id}/logo',
    '/skills/99/logo',
    { auth: true, ...multipart('image/png') },
    () => container.uploadSkillLogo.execute.mockImplementation(notFound),
  ],
  [
    'POST',
    '/skills/{id}/logo',
    '/skills/1/logo',
    { auth: true, ...multipart('image/png', 2 * 1024 * 1024 + 1) },
  ],
  ['POST', '/skills/{id}/logo', '/skills/1/logo', { auth: true, ...multipart('image/gif') }],

  [
    'GET',
    '/profile/social-media',
    '/profile/social-media',
    {},
    () => container.listSocialMedia.execute.mockResolvedValue([socialMedia]),
  ],
  [
    'GET',
    '/profile/social-media/{platform}',
    '/profile/social-media/github',
    {},
    () => container.getSocialMediaByPlatform.execute.mockResolvedValue(socialMedia),
  ],
  ['GET', '/profile/social-media/{platform}', '/profile/social-media/myspace', {}],
  [
    'GET',
    '/profile/social-media/{platform}',
    '/profile/social-media/github',
    {},
    () => container.getSocialMediaByPlatform.execute.mockImplementation(notFound),
  ],
  [
    'PUT',
    '/profile/social-media/{platform}',
    '/profile/social-media/github',
    { auth: true, payload: { enabled: false } },
    () => container.updateSocialMedia.execute.mockResolvedValue(socialMedia),
  ],
  [
    'PUT',
    '/profile/social-media/{platform}',
    '/profile/social-media/github',
    { auth: true, payload: { url: 'bukan url' } },
  ],
  [
    'PUT',
    '/profile/social-media/{platform}',
    '/profile/social-media/github',
    { payload: { enabled: false } },
  ],
  [
    'PUT',
    '/profile/social-media/{platform}',
    '/profile/social-media/github',
    { auth: true, payload: { enabled: false } },
    () => container.updateSocialMedia.execute.mockImplementation(notFound),
  ],
];

// --- Profile & timeline (M5) ---
const ConflictError = require('../../src/exceptions/ConflictError');
const ValidationError = require('../../src/exceptions/ValidationError');

const profile = {
  greeting: "Hi, I'm Ary",
  tagline: 'a developer',
  about: 'Tentang saya',
  projectIntro: null,
  email: 'admin@example.com',
  updatedAt: new Date('2026-11-11T00:00:00Z'),
};
const position = {
  id: 5,
  organizationId: 1,
  title: 'Ketua Panitia',
  type: 'committee',
  eventName: 'Diksar',
  startDate: '2024-01',
  endDate: null,
  isCurrent: false,
  description: null,
  sortOrder: 1,
};
const organization = {
  id: 1,
  name: 'MAPALA',
  group: 'work_organization',
  location: null,
  sortOrder: null,
  positions: [position],
};
const conflict = () =>
  Promise.reject(new ConflictError('Duplicate.', [{ field: 'name', message: 'Already used.' }]));
const invalid = () =>
  Promise.reject(
    new ValidationError('Some fields are invalid.', [{ field: 'end_date', message: 'x' }])
  );
const resolves = (useCase, value) => () => container[useCase].execute.mockResolvedValue(value);
const rejects = (useCase, fn) => () => container[useCase].execute.mockImplementation(fn);

const positionInput = {
  organization_id: 1,
  title: 'Ketua',
  type: 'committee',
  event_name: 'Diksar',
  start_date: '2024-01',
};

scenarios.push(
  ['GET', '/admin/profile', '/admin/profile', { auth: true }, resolves('getProfile', profile)],
  ['GET', '/admin/profile', '/admin/profile', {}],
  ['GET', '/admin/profile', '/admin/profile', { auth: true }, rejects('getProfile', notFound)],
  [
    'PATCH',
    '/admin/profile',
    '/admin/profile',
    { auth: true, payload: { tagline: 'x' } },
    resolves('updateProfile', profile),
  ],
  ['PATCH', '/admin/profile', '/admin/profile', { auth: true, payload: {} }],
  ['PATCH', '/admin/profile', '/admin/profile', { payload: { tagline: 'x' } }],
  [
    'PATCH',
    '/admin/profile',
    '/admin/profile',
    { auth: true, payload: { tagline: 'x' } },
    rejects('updateProfile', notFound),
  ],

  [
    'GET',
    '/admin/organizations',
    '/admin/organizations',
    { auth: true },
    resolves('listOrganizations', [organization]),
  ],
  ['GET', '/admin/organizations', '/admin/organizations?group=hobby', { auth: true }],
  ['GET', '/admin/organizations', '/admin/organizations', {}],
  [
    'POST',
    '/admin/organizations',
    '/admin/organizations',
    { auth: true, payload: { name: 'X', group: 'education' } },
    resolves('createOrganization', { ...organization, positions: [] }),
  ],
  ['POST', '/admin/organizations', '/admin/organizations', { auth: true, payload: { name: 'X' } }],
  [
    'POST',
    '/admin/organizations',
    '/admin/organizations',
    { payload: { name: 'X', group: 'education' } },
  ],
  [
    'POST',
    '/admin/organizations',
    '/admin/organizations',
    { auth: true, payload: { name: 'X', group: 'education' } },
    rejects('createOrganization', conflict),
  ],

  [
    'PATCH',
    '/admin/organizations/{id}',
    '/admin/organizations/1',
    { auth: true, payload: { location: 'Makassar' } },
    resolves('updateOrganization', organization),
  ],
  [
    'PATCH',
    '/admin/organizations/{id}',
    '/admin/organizations/1',
    { auth: true, payload: { group: 'education' } },
  ],
  ['PATCH', '/admin/organizations/{id}', '/admin/organizations/1', { payload: { location: 'x' } }],
  [
    'PATCH',
    '/admin/organizations/{id}',
    '/admin/organizations/99',
    { auth: true, payload: { location: 'x' } },
    rejects('updateOrganization', notFound),
  ],
  [
    'PATCH',
    '/admin/organizations/{id}',
    '/admin/organizations/1',
    { auth: true, payload: { name: 'Lain' } },
    rejects('updateOrganization', conflict),
  ],
  [
    'DELETE',
    '/admin/organizations/{id}',
    '/admin/organizations/1',
    { auth: true },
    resolves('deleteOrganization', undefined),
  ],
  ['DELETE', '/admin/organizations/{id}', '/admin/organizations/abc', { auth: true }],
  ['DELETE', '/admin/organizations/{id}', '/admin/organizations/1', {}],
  [
    'DELETE',
    '/admin/organizations/{id}',
    '/admin/organizations/99',
    { auth: true },
    rejects('deleteOrganization', notFound),
  ],

  [
    'PATCH',
    '/admin/organizations/{id}/positions/reorder',
    '/admin/organizations/1/positions/reorder',
    { auth: true, payload: { ids: [2, 1] } },
    resolves('reorderPositions', undefined),
  ],
  [
    'PATCH',
    '/admin/organizations/{id}/positions/reorder',
    '/admin/organizations/1/positions/reorder',
    { auth: true, payload: { ids: [] } },
  ],
  [
    'PATCH',
    '/admin/organizations/{id}/positions/reorder',
    '/admin/organizations/1/positions/reorder',
    { payload: { ids: [1] } },
  ],
  [
    'PATCH',
    '/admin/organizations/{id}/positions/reorder',
    '/admin/organizations/99/positions/reorder',
    { auth: true, payload: { ids: [1] } },
    rejects('reorderPositions', notFound),
  ],

  [
    'POST',
    '/admin/positions',
    '/admin/positions',
    { auth: true, payload: positionInput },
    resolves('createPosition', position),
  ],
  [
    'POST',
    '/admin/positions',
    '/admin/positions',
    { auth: true, payload: positionInput },
    rejects('createPosition', invalid),
  ],
  ['POST', '/admin/positions', '/admin/positions', { payload: positionInput }],
  [
    'POST',
    '/admin/positions',
    '/admin/positions',
    { auth: true, payload: positionInput },
    rejects('createPosition', notFound),
  ],
  [
    'PATCH',
    '/admin/positions/{id}',
    '/admin/positions/5',
    { auth: true, payload: { title: 'x' } },
    resolves('updatePosition', position),
  ],
  ['PATCH', '/admin/positions/{id}', '/admin/positions/5', { auth: true, payload: {} }],
  ['PATCH', '/admin/positions/{id}', '/admin/positions/5', { payload: { title: 'x' } }],
  [
    'PATCH',
    '/admin/positions/{id}',
    '/admin/positions/99',
    { auth: true, payload: { title: 'x' } },
    rejects('updatePosition', notFound),
  ],
  [
    'DELETE',
    '/admin/positions/{id}',
    '/admin/positions/5',
    { auth: true },
    resolves('deletePosition', undefined),
  ],
  ['DELETE', '/admin/positions/{id}', '/admin/positions/abc', { auth: true }],
  ['DELETE', '/admin/positions/{id}', '/admin/positions/5', {}],
  [
    'DELETE',
    '/admin/positions/{id}',
    '/admin/positions/99',
    { auth: true },
    rejects('deletePosition', notFound),
  ]
);

// --- Skill categories & projects (M5 bagian 2) ---
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
const category = { id: 1, name: 'Backend', sortOrder: 1 };

scenarios.push(
  [
    'GET',
    '/admin/skill-categories',
    '/admin/skill-categories',
    { auth: true },
    resolves('listSkillCategories', [category]),
  ],
  ['GET', '/admin/skill-categories', '/admin/skill-categories', {}],
  [
    'POST',
    '/admin/skill-categories',
    '/admin/skill-categories',
    { auth: true, payload: { name: 'Tools' } },
    resolves('createSkillCategory', category),
  ],
  [
    'POST',
    '/admin/skill-categories',
    '/admin/skill-categories',
    { auth: true, payload: { name: '' } },
  ],
  ['POST', '/admin/skill-categories', '/admin/skill-categories', { payload: { name: 'Tools' } }],
  [
    'POST',
    '/admin/skill-categories',
    '/admin/skill-categories',
    { auth: true, payload: { name: 'Tools' } },
    rejects('createSkillCategory', conflict),
  ],
  [
    'PATCH',
    '/admin/skill-categories/reorder',
    '/admin/skill-categories/reorder',
    { auth: true, payload: { ids: [2, 1] } },
    resolves('reorderSkillCategories', undefined),
  ],
  [
    'PATCH',
    '/admin/skill-categories/reorder',
    '/admin/skill-categories/reorder',
    { auth: true, payload: { ids: [2, 1] } },
    rejects('reorderSkillCategories', invalid),
  ],
  [
    'PATCH',
    '/admin/skill-categories/reorder',
    '/admin/skill-categories/reorder',
    { payload: { ids: [1] } },
  ],
  [
    'PATCH',
    '/admin/skill-categories/{id}',
    '/admin/skill-categories/1',
    { auth: true, payload: { name: 'X' } },
    resolves('updateSkillCategory', category),
  ],
  [
    'PATCH',
    '/admin/skill-categories/{id}',
    '/admin/skill-categories/1',
    { auth: true, payload: {} },
  ],
  [
    'PATCH',
    '/admin/skill-categories/{id}',
    '/admin/skill-categories/1',
    { payload: { name: 'X' } },
  ],
  [
    'PATCH',
    '/admin/skill-categories/{id}',
    '/admin/skill-categories/99',
    { auth: true, payload: { name: 'X' } },
    rejects('updateSkillCategory', notFound),
  ],
  [
    'PATCH',
    '/admin/skill-categories/{id}',
    '/admin/skill-categories/1',
    { auth: true, payload: { name: 'X' } },
    rejects('updateSkillCategory', conflict),
  ],
  [
    'DELETE',
    '/admin/skill-categories/{id}',
    '/admin/skill-categories/1',
    { auth: true },
    resolves('deleteSkillCategory', undefined),
  ],
  ['DELETE', '/admin/skill-categories/{id}', '/admin/skill-categories/abc', { auth: true }],
  ['DELETE', '/admin/skill-categories/{id}', '/admin/skill-categories/1', {}],
  [
    'DELETE',
    '/admin/skill-categories/{id}',
    '/admin/skill-categories/99',
    { auth: true },
    rejects('deleteSkillCategory', notFound),
  ],

  [
    'GET',
    '/admin/projects',
    '/admin/projects',
    { auth: true },
    resolves('listProjects', { data: [project], meta: { page: 1, limit: 12, total: 1 } }),
  ],
  ['GET', '/admin/projects', '/admin/projects?limit=99', { auth: true }],
  ['GET', '/admin/projects', '/admin/projects', {}],
  [
    'POST',
    '/admin/projects',
    '/admin/projects',
    { auth: true, payload: { title: 'a', description: 'b', image_id: 7 } },
    resolves('createProject', project),
  ],
  ['POST', '/admin/projects', '/admin/projects', { auth: true, payload: { title: 'a' } }],
  ['POST', '/admin/projects', '/admin/projects', { payload: { title: 'a', description: 'b' } }],
  [
    'PATCH',
    '/admin/projects/reorder',
    '/admin/projects/reorder',
    { auth: true, payload: { ids: [2, 1] } },
    resolves('reorderProjects', undefined),
  ],
  ['PATCH', '/admin/projects/reorder', '/admin/projects/reorder', { auth: true, payload: {} }],
  ['PATCH', '/admin/projects/reorder', '/admin/projects/reorder', { payload: { ids: [1] } }],
  [
    'GET',
    '/admin/projects/{id}',
    '/admin/projects/1',
    { auth: true },
    resolves('getProject', project),
  ],
  ['GET', '/admin/projects/{id}', '/admin/projects/abc', { auth: true }],
  ['GET', '/admin/projects/{id}', '/admin/projects/1', {}],
  [
    'GET',
    '/admin/projects/{id}',
    '/admin/projects/99',
    { auth: true },
    rejects('getProject', notFound),
  ],
  [
    'PATCH',
    '/admin/projects/{id}',
    '/admin/projects/1',
    { auth: true, payload: { title: 'x' } },
    resolves('updateProject', project),
  ],
  [
    'PATCH',
    '/admin/projects/{id}',
    '/admin/projects/1',
    { auth: true, payload: { link_url: null } },
    rejects('updateProject', invalid),
  ],
  ['PATCH', '/admin/projects/{id}', '/admin/projects/1', { payload: { title: 'x' } }],
  [
    'PATCH',
    '/admin/projects/{id}',
    '/admin/projects/99',
    { auth: true, payload: { title: 'x' } },
    rejects('updateProject', notFound),
  ],
  [
    'DELETE',
    '/admin/projects/{id}',
    '/admin/projects/1',
    { auth: true },
    resolves('deleteProject', undefined),
  ],
  ['DELETE', '/admin/projects/{id}', '/admin/projects/abc', { auth: true }],
  ['DELETE', '/admin/projects/{id}', '/admin/projects/1', {}],
  [
    'DELETE',
    '/admin/projects/{id}',
    '/admin/projects/99',
    { auth: true },
    rejects('deleteProject', notFound),
  ]
);

// --- Public (M6) ---
const publicTimeline = { education: [], work_organization: [organization] };
const publicSocial = [
  { platform: 'github', url: 'https://github.com/x', username: 'x', enabled: true },
];

scenarios.push(
  [
    'GET',
    '/portfolio',
    '/portfolio',
    {},
    resolves('getPortfolio', {
      profile,
      projects: { items: [project], total: 1, hasMore: false },
      timeline: publicTimeline,
      socialLinks: publicSocial,
    }),
  ],
  ['GET', '/portfolio', '/portfolio', {}, rejects('getPortfolio', notFound)],
  ['GET', '/profile', '/profile', {}, resolves('getProfile', profile)],
  ['GET', '/profile', '/profile', {}, rejects('getProfile', notFound)],
  [
    'GET',
    '/projects',
    '/projects',
    {},
    resolves('listPublishedProjects', { data: [project], meta: { page: 1, limit: 12, total: 1 } }),
  ],
  ['GET', '/projects', '/projects?page=0', {}],
  ['GET', '/projects/{id}', '/projects/1', {}, resolves('getPublishedProject', project)],
  ['GET', '/projects/{id}', '/projects/abc', {}],
  ['GET', '/projects/{id}', '/projects/99', {}, rejects('getPublishedProject', notFound)],
  ['GET', '/timeline', '/timeline', {}, resolves('getTimeline', publicTimeline)],
  ['GET', '/social-links', '/social-links', {}, resolves('listPublicSocialLinks', publicSocial)]
);

// --- Uploads (M4) ---
const UnsupportedMediaTypeError = require('../../src/exceptions/UnsupportedMediaTypeError');
const uploadedMedia = {
  id: 3,
  kind: 'project_image',
  objectKey: 'project_image/u-800.webp',
  mime: 'image/webp',
  width: 1600,
  height: 900,
  variants: { 400: 'project_image/u-400.webp', 800: 'project_image/u-800.webp' },
};
const fileUpload = (sizeBytes = 10) => {
  const boundary = 'batas-kontrak-upload';
  return {
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    payload: Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="f"\r\nContent-Type: image/png\r\n\r\n`
      ),
      Buffer.alloc(sizeBytes, 'a'),
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]),
  };
};

scenarios.push(
  [
    'POST',
    '/admin/uploads',
    '/admin/uploads?kind=project_image',
    { auth: true, ...fileUpload() },
    resolves('uploadMedia', uploadedMedia),
  ],
  ['POST', '/admin/uploads', '/admin/uploads?kind=avatar', { auth: true, ...fileUpload() }],
  ['POST', '/admin/uploads', '/admin/uploads?kind=project_image', fileUpload()],
  [
    'POST',
    '/admin/uploads',
    '/admin/uploads?kind=project_image',
    { auth: true, ...fileUpload(2 * 1024 * 1024 + 1) },
  ],
  [
    'POST',
    '/admin/uploads',
    '/admin/uploads?kind=project_image',
    { auth: true, ...fileUpload() },
    rejects('uploadMedia', () =>
      Promise.reject(new UnsupportedMediaTypeError('Use PNG, JPG or WebP.'))
    ),
  ],
  [
    'DELETE',
    '/admin/uploads/{id}',
    '/admin/uploads/3',
    { auth: true },
    resolves('deleteMedia', undefined),
  ],
  ['DELETE', '/admin/uploads/{id}', '/admin/uploads/abc', { auth: true }],
  ['DELETE', '/admin/uploads/{id}', '/admin/uploads/3', {}],
  [
    'DELETE',
    '/admin/uploads/{id}',
    '/admin/uploads/99',
    { auth: true },
    rejects('deleteMedia', notFound),
  ],
  [
    'DELETE',
    '/admin/uploads/{id}',
    '/admin/uploads/3',
    { auth: true },
    rejects('deleteMedia', conflict),
  ],
  // gambar terisi pada project & profil (bukan hanya null)
  [
    'GET',
    '/projects',
    '/projects',
    {},
    resolves('listPublishedProjects', {
      data: [{ ...project, image: uploadedMedia }],
      meta: { page: 1, limit: 12, total: 1 },
    }),
  ],
  [
    'GET',
    '/admin/profile',
    '/admin/profile',
    { auth: true },
    resolves('getProfile', { ...profile, photo: { ...uploadedMedia, kind: 'profile_photo' } }),
  ]
);

describe('Kontrak docs/openapi.yaml', () => {
  let server;
  const exercised = new Set();

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('setiap route server terdokumentasi, dan setiap operasi di dokumen ada di server', () => {
    // ARRANGE
    const serverRoutes = server
      .table()
      .map((route) => `${route.method.toUpperCase()} ${route.path.replace(API_PREFIX, '')}`)
      .sort();

    // ASSERT
    expect(serverRoutes).toEqual(listOperations().sort());
  });

  it.each(scenarios.map((scenario) => [`${scenario[0]} ${scenario[2]}`, scenario]))(
    'respons %s cocok dengan skema',
    async (_title, [method, routePath, url, options, setup]) => {
      // ARRANGE
      setup?.();
      const { auth, headers = {}, payload } = options;

      // ACT
      const response = await server.inject({
        method,
        url: `${API_PREFIX}${url}`,
        headers: { ...headers, ...(auth ? authHeader() : {}) },
        payload,
      });
      exercised.add(`${method} ${routePath} ${response.statusCode}`);

      // ASSERT
      expect(() => assertMatchesSpec({ method, routePath, response })).not.toThrow();
    }
  );

  it('setiap status respons yang terdokumentasi pernah diuji', () => {
    // ASSERT
    const untested = listDocumentedResponses().filter((key) => !exercised.has(key));
    expect(untested).toEqual([]);
  });
});
