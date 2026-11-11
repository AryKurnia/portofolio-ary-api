// Endpoint publik dengan aplikasi asli + database tes (tanpa mock).
const { sequelize, assertTestDatabase, query } = require('./db');
const { createServer } = require('../../src/server');

describe('Endpoint publik (MariaDB tes)', () => {
  const PREFIX = '[it-public] ';
  let server;
  let draftId;
  let publishedId;

  const get = (url, headers = {}) =>
    server.inject({ method: 'GET', url: `/api/v1${url}`, headers });

  beforeAll(async () => {
    await assertTestDatabase();
    await query('DELETE FROM projects WHERE title LIKE ?', [`${PREFIX}%`]);
    await query("DELETE FROM media WHERE object_key = 'it-public/img.webp'");
    await query(
      "INSERT INTO media (kind, object_key, mime, size_bytes) VALUES ('project_image', 'it-public/img.webp', 'image/webp', 1)"
    );
    const [{ id: mediaId }] = await query(
      "SELECT id FROM media WHERE object_key = 'it-public/img.webp'"
    );
    await query(
      'INSERT INTO projects (title, description, image_media_id, link_url, show_button, is_published, sort_order) VALUES (?, ?, ?, ?, 1, 1, -100), (?, ?, NULL, NULL, 0, 0, -101)',
      [`${PREFIX}Terbit`, 'x', mediaId, 'https://x.dev', `${PREFIX}Draf`, 'y']
    );
    [{ id: publishedId }] = await query('SELECT id FROM projects WHERE title = ?', [
      `${PREFIX}Terbit`,
    ]);
    [{ id: draftId }] = await query('SELECT id FROM projects WHERE title = ?', [`${PREFIX}Draf`]);
    server = await createServer();
  });

  afterAll(async () => {
    await query('DELETE FROM projects WHERE title LIKE ?', [`${PREFIX}%`]);
    await query("DELETE FROM media WHERE object_key = 'it-public/img.webp'");
    await sequelize.close();
  });

  it('GET /projects hanya berisi project terbit (draf tidak bocor)', async () => {
    const response = await get('/projects?limit=50');
    const titles = response.result.data.map((p) => p.title);
    expect(titles).toContain(`${PREFIX}Terbit`);
    expect(titles).not.toContain(`${PREFIX}Draf`);
    expect(response.result.data.every((p) => !('is_published' in p))).toBe(true);
  });

  it('GET /projects/{id}: terbit → 200, draf → 404', async () => {
    expect((await get(`/projects/${publishedId}`)).statusCode).toBe(200);
    expect((await get(`/projects/${draftId}`)).statusCode).toBe(404);
  });

  it('GET /timeline mengembalikan data seed yang terurut dan berlabel', async () => {
    const { result } = await get('/timeline');
    expect(Object.keys(result.data).sort()).toEqual(['education', 'work_organization']);
    const allPositions = [...result.data.education, ...result.data.work_organization].flatMap(
      (o) => o.positions
    );
    expect(allPositions.length).toBeGreaterThan(0);
    expect(allPositions.every((p) => /^\d{4}( – (\d{4}|Present))?$/.test(p.period_label))).toBe(
      true
    );
  });

  it('GET /portfolio menggabungkan semua section, project terbit di urutan pertama', async () => {
    const { statusCode, result } = await get('/portfolio');
    expect(statusCode).toBe(200);
    expect(result.data.profile.greeting).toBeTruthy();
    expect(result.data.projects.items[0].title).toBe(`${PREFIX}Terbit`);
    expect(result.data.projects.items.map((p) => p.title)).not.toContain(`${PREFIX}Draf`);
    expect(result.data.social_links.every((l) => l.label && l.url)).toBe(true);
  });

  it('ETag dari data sungguhan menghasilkan 304 pada request berikutnya', async () => {
    const first = await get('/timeline');
    const second = await get('/timeline', { 'if-none-match': first.headers.etag });
    expect(second.statusCode).toBe(304);
  });
});
