jest.mock('../../../infrastructure/container', () =>
  require('../../../../test/helpers/http').createContainerMock()
);

const container = require('../../../infrastructure/container');
const { createServer } = require('../../../server');
const { authHeader } = require('../../../../test/helpers/http');
const ValidationError = require('../../../exceptions/ValidationError');
const ConflictError = require('../../../exceptions/ConflictError');

describe('HTTP routes timeline admin', () => {
  let server;
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
    sortOrder: null,
  };
  const organization = {
    id: 1,
    name: 'MAPALA',
    group: 'work_organization',
    location: null,
    sortOrder: null,
    positions: [position],
  };
  const inject = (method, url, payload) =>
    server.inject({ method, url: `/api/v1/admin${url}`, headers: authHeader(), payload });

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('GET /organizations?group= meneruskan filter dan mengembalikan posisi berlabel', async () => {
    container.listOrganizations.execute.mockResolvedValue([organization]);
    const response = await inject('GET', '/organizations?group=work_organization');
    expect(response.statusCode).toBe(200);
    expect(container.listOrganizations.execute).toHaveBeenCalledWith({
      group: 'work_organization',
    });
    expect(response.result.data[0].positions[0]).toEqual(
      expect.objectContaining({
        type_label: 'Board',
        period_label: '2023 – 2025',
        start_date: '2023-01',
      })
    );
  });

  it('GET /organizations menolak group yang tidak dikenal', async () => {
    const response = await inject('GET', '/organizations?group=hobby');
    expect(response.statusCode).toBe(400);
  });

  it('POST /organizations → 201; 409 dengan detail field kalau duplikat', async () => {
    container.createOrganization.execute.mockResolvedValueOnce({ ...organization, positions: [] });
    let response = await inject('POST', '/organizations', {
      name: 'MAPALA',
      group: 'work_organization',
    });
    expect(response.statusCode).toBe(201);

    container.createOrganization.execute.mockRejectedValueOnce(
      new ConflictError('Duplicate.', [
        { field: 'name', message: 'Name is already used in this group.' },
      ])
    );
    response = await inject('POST', '/organizations', {
      name: 'MAPALA',
      group: 'work_organization',
    });
    expect(response.statusCode).toBe(409);
    expect(response.result.error).toEqual(
      expect.objectContaining({
        code: 'CONFLICT',
        details: [{ field: 'name', message: expect.any(String) }],
      })
    );
  });

  it('PATCH /organizations/{id} menolak perubahan group', async () => {
    const response = await inject('PATCH', '/organizations/1', { group: 'education' });
    expect(response.statusCode).toBe(400);
    expect(container.updateOrganization.execute).not.toHaveBeenCalled();
  });

  it('POST /positions dengan organization_id → payload diterjemahkan ke camelCase', async () => {
    container.createPosition.execute.mockResolvedValue(position);
    const response = await inject('POST', '/positions', {
      organization_id: 1,
      title: 'Sekretaris Umum',
      type: 'board',
      start_date: '2023-01',
      end_date: '2025-01',
    });
    expect(response.statusCode).toBe(201);
    expect(container.createPosition.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 1,
        startDate: '2023-01',
        endDate: '2025-01',
        isCurrent: false,
      })
    );
  });

  it.each([
    ['tanpa organisasi', { title: 'x', type: 'member', start_date: '2023-01' }],
    [
      'organization_id dan organization_name sekaligus',
      {
        organization_id: 1,
        organization_name: 'X',
        group: 'education',
        title: 'x',
        type: 'member',
        start_date: '2023-01',
      },
    ],
    [
      'organization_name tanpa group',
      { organization_name: 'X', title: 'x', type: 'member', start_date: '2023-01' },
    ],
    [
      'format tanggal salah',
      { organization_id: 1, title: 'x', type: 'member', start_date: '2023-13' },
    ],
    ['tipe tidak dikenal', { organization_id: 1, title: 'x', type: 'ceo', start_date: '2023-01' }],
  ])('POST /positions menolak %s', async (_label, payload) => {
    const response = await inject('POST', '/positions', payload);
    expect(response.statusCode).toBe(400);
    expect(container.createPosition.execute).not.toHaveBeenCalled();
  });

  it('POST /positions meneruskan pelanggaran aturan bisnis sebagai 400 per field', async () => {
    container.createPosition.execute.mockRejectedValue(
      new ValidationError('Some fields are invalid.', [
        { field: 'event_name', message: 'Event name is required.' },
      ])
    );
    const response = await inject('POST', '/positions', {
      organization_id: 1,
      title: 'Ketua',
      type: 'committee',
      start_date: '2024-01',
    });
    expect(response.statusCode).toBe(400);
    expect(response.result.error.details).toEqual([
      { field: 'event_name', message: 'Event name is required.' },
    ]);
  });

  it('PATCH /positions/{id} hanya meneruskan field yang dikirim', async () => {
    container.updatePosition.execute.mockResolvedValue(position);
    await inject('PATCH', '/positions/5', { is_current: true, end_date: null });
    expect(container.updatePosition.execute).toHaveBeenCalledWith(5, {
      title: undefined,
      type: undefined,
      eventName: undefined,
      startDate: undefined,
      endDate: null,
      isCurrent: true,
      description: undefined,
    });
  });

  it('PATCH /organizations/{id}/positions/reorder → 204; menolak ids ganda', async () => {
    container.reorderPositions.execute.mockResolvedValue(undefined);
    let response = await inject('PATCH', '/organizations/1/positions/reorder', { ids: [3, 1, 2] });
    expect(response.statusCode).toBe(204);
    expect(container.reorderPositions.execute).toHaveBeenCalledWith(1, [3, 1, 2]);

    response = await inject('PATCH', '/organizations/1/positions/reorder', { ids: [1, 1] });
    expect(response.statusCode).toBe(400);
  });

  it('DELETE organisasi/posisi → 204', async () => {
    expect((await inject('DELETE', '/organizations/1')).statusCode).toBe(204);
    expect((await inject('DELETE', '/positions/5')).statusCode).toBe(204);
  });

  it('semua endpoint timeline admin butuh token', async () => {
    const response = await server.inject({ method: 'GET', url: '/api/v1/admin/organizations' });
    expect(response.statusCode).toBe(401);
  });
});
