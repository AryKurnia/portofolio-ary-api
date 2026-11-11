jest.mock('../../../infrastructure/container', () =>
  require('../../../../test/helpers/http').createContainerMock()
);

const container = require('../../../infrastructure/container');
const { createServer } = require('../../../server');
const { authHeader } = require('../../../../test/helpers/http');
const NotFoundError = require('../../../exceptions/NotFoundError');

describe('HTTP routes /api/v1/skills', () => {
  let server;

  const skill = {
    id: 1,
    name: 'Jest',
    logoUrl: 'https://minio.example.com/skills/1.png',
    description: 'Testing framework',
    enabled: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
  };

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /skills mengembalikan list snake_case dalam envelope data + meta', async () => {
    // ARRANGE
    const meta = { page: 1, limit: 10, total: 1 };
    container.listSkills.execute.mockResolvedValue({ data: [skill], meta });

    // ACT
    const response = await server.inject({ method: 'GET', url: '/api/v1/skills' });

    // ASSERT
    expect(response.statusCode).toBe(200);
    expect(container.listSkills.execute).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(response.result.meta).toEqual(meta);
    expect(response.result.data[0]).toEqual(
      expect.objectContaining({ id: 1, logo_url: skill.logoUrl, created_at: skill.createdAt })
    );
    expect(response.result.data[0]).not.toHaveProperty('logoUrl');
  });

  it('GET /skills/{id} mengembalikan 200 dan skill dalam envelope data', async () => {
    // ARRANGE
    container.getSkill.execute.mockResolvedValue(skill);

    // ACT
    const response = await server.inject({ method: 'GET', url: '/api/v1/skills/1' });

    // ASSERT
    expect(response.statusCode).toBe(200);
    expect(container.getSkill.execute).toHaveBeenCalledWith(1);
    expect(response.result.data).toEqual(expect.objectContaining({ id: 1, name: 'Jest' }));
  });

  it('presenter hanya mengirim field yang didefinisikan, atribut entity lain tidak bocor', async () => {
    // ARRANGE
    container.getSkill.execute.mockResolvedValue({ ...skill, internalNote: 'rahasia' });

    // ACT
    const response = await server.inject({ method: 'GET', url: '/api/v1/skills/1' });

    // ASSERT
    expect(response.result.data).not.toHaveProperty('internalNote');
  });

  it('GET /skills/{id} mengembalikan 404 NOT_FOUND kalau use-case melempar NotFoundError', async () => {
    // ARRANGE
    container.getSkill.execute.mockRejectedValue(
      new NotFoundError('Skill with id 99 was not found.')
    );

    // ACT
    const response = await server.inject({ method: 'GET', url: '/api/v1/skills/99' });

    // ASSERT
    expect(response.statusCode).toBe(404);
    expect(response.result).toEqual({
      error: { code: 'NOT_FOUND', message: 'Skill with id 99 was not found.' },
    });
  });

  it('GET /skills/{id} mengembalikan 400 VALIDATION_ERROR dan tidak memanggil use-case kalau id bukan angka', async () => {
    // ACT
    const response = await server.inject({ method: 'GET', url: '/api/v1/skills/abc' });

    // ASSERT
    expect(response.statusCode).toBe(400);
    expect(response.result.error.code).toBe('VALIDATION_ERROR');
    expect(response.result.error.details).toEqual([{ field: 'id', message: expect.any(String) }]);
    expect(container.getSkill.execute).not.toHaveBeenCalled();
  });

  it('POST /skills mengembalikan semua field yang tidak valid sekaligus', async () => {
    // ACT
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/skills',
      headers: authHeader(),
      payload: { name: 'x'.repeat(101), enabled: 'bukan-boolean' },
    });

    // ASSERT
    expect(response.statusCode).toBe(400);
    const fields = response.result.error.details.map((detail) => detail.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'enabled']));
    expect(container.createSkill.execute).not.toHaveBeenCalled();
  });

  it('POST /skills mengembalikan 401 UNAUTHORIZED dan tidak memanggil use-case tanpa token', async () => {
    // ACT
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/skills',
      payload: { name: 'Jest' },
    });

    // ASSERT
    expect(response.statusCode).toBe(401);
    expect(response.result.error.code).toBe('UNAUTHORIZED');
    expect(container.createSkill.execute).not.toHaveBeenCalled();
  });

  it('POST /skills mengembalikan 201 dengan token yang valid', async () => {
    // ARRANGE
    container.createSkill.execute.mockResolvedValue({ ...skill, id: 2 });

    // ACT
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/skills',
      headers: authHeader(),
      payload: { name: 'Jest' },
    });

    // ASSERT
    expect(response.statusCode).toBe(201);
    expect(container.createSkill.execute).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Jest', enabled: true })
    );
    expect(response.result.data.id).toBe(2);
  });

  it('POST /skills/{id}/logo mengembalikan 413 PAYLOAD_TOO_LARGE untuk file di atas 2 MB', async () => {
    // ARRANGE
    const boundary = 'batas-tes';
    const oversized = Buffer.alloc(2 * 1024 * 1024 + 1, 'a');
    const payload = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="logo"; filename="logo.png"\r\nContent-Type: image/png\r\n\r\n`
      ),
      oversized,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    // ACT
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/skills/1/logo',
      headers: { ...authHeader(), 'content-type': `multipart/form-data; boundary=${boundary}` },
      payload,
    });

    // ASSERT
    expect(response.statusCode).toBe(413);
    expect(response.result.error).toEqual({
      code: 'PAYLOAD_TOO_LARGE',
      message: 'File must be 2 MB or smaller.',
    });
    expect(container.uploadSkillLogo.execute).not.toHaveBeenCalled();
  });

  it('DELETE /skills/{id} mengembalikan 204 tanpa body', async () => {
    // ARRANGE
    container.deleteSkill.execute.mockResolvedValue(undefined);

    // ACT
    const response = await server.inject({
      method: 'DELETE',
      url: '/api/v1/skills/1',
      headers: authHeader(),
    });

    // ASSERT
    expect(response.statusCode).toBe(204);
    expect(container.deleteSkill.execute).toHaveBeenCalledWith(1);
  });
});
