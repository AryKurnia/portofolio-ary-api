const ListOrganizations = require('./ListOrganizations');
const CreateOrganization = require('./CreateOrganization');
const UpdateOrganization = require('./UpdateOrganization');
const DeleteOrganization = require('./DeleteOrganization');
const Organization = require('../../entities/Organization');
const NotFoundError = require('../../exceptions/NotFoundError');
const ConflictError = require('../../exceptions/ConflictError');

const existing = new Organization({
  id: 1,
  name: 'MAPALA',
  group: 'work_organization',
  location: null,
});

const createRepo = (overrides = {}) => ({
  findAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(existing),
  findByNameAndGroup: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockImplementation(async (o) => ({ ...o, id: 2 })),
  update: jest.fn().mockImplementation(async (id, o) => ({ ...o, id })),
  delete: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('ListOrganizations use-case', () => {
  it('meneruskan filter group dan mengembalikan hasil yang sudah diurutkan', async () => {
    // ARRANGE
    const lama = new Organization({
      id: 1,
      name: 'Lama',
      positions: [{ startDate: '2018-01', isCurrent: false }],
    });
    const baru = new Organization({
      id: 2,
      name: 'Baru',
      positions: [{ startDate: '2024-01', isCurrent: false }],
    });
    const repo = createRepo({ findAll: jest.fn().mockResolvedValue([lama, baru]) });

    // ACT
    const result = await new ListOrganizations(repo).execute({ group: 'education' });

    // ASSERT
    expect(repo.findAll).toHaveBeenCalledWith({ group: 'education' });
    expect(result.map((o) => o.id)).toEqual([2, 1]);
  });

  it('meneruskan error kalau repository.findAll gagal', async () => {
    const repo = createRepo({ findAll: jest.fn().mockRejectedValue(new Error('DB error')) });
    await expect(new ListOrganizations(repo).execute()).rejects.toThrow('DB error');
  });
});

describe('CreateOrganization use-case', () => {
  it('membuat organisasi baru', async () => {
    const repo = createRepo();
    const result = await new CreateOrganization(repo).execute({
      name: 'Unhas',
      group: 'education',
    });
    expect(repo.findByNameAndGroup).toHaveBeenCalledWith('Unhas', 'education');
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Unhas', group: 'education', location: null })
    );
    expect(result.id).toBe(2);
  });

  it('melempar ConflictError dan tidak membuat apa pun kalau nama sudah ada di grup itu', async () => {
    const repo = createRepo({ findByNameAndGroup: jest.fn().mockResolvedValue(existing) });
    const result = new CreateOrganization(repo).execute({
      name: 'MAPALA',
      group: 'work_organization',
    });
    await expect(result).rejects.toThrow(ConflictError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau findByNameAndGroup gagal', async () => {
    const repo = createRepo({
      findByNameAndGroup: jest.fn().mockRejectedValue(new Error('DB error')),
    });
    await expect(
      new CreateOrganization(repo).execute({ name: 'x', group: 'education' })
    ).rejects.toThrow('DB error');
  });

  it('meneruskan error kalau create gagal', async () => {
    const repo = createRepo({ create: jest.fn().mockRejectedValue(new Error('DB error')) });
    await expect(
      new CreateOrganization(repo).execute({ name: 'x', group: 'education' })
    ).rejects.toThrow('DB error');
  });
});

describe('UpdateOrganization use-case', () => {
  it('mengubah lokasi tanpa cek duplikat nama', async () => {
    const repo = createRepo();
    await new UpdateOrganization(repo).execute(1, { location: 'Makassar' });
    expect(repo.findByNameAndGroup).not.toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ name: 'MAPALA', location: 'Makassar' })
    );
  });

  it('cek duplikat nama di grup yang sama saat nama diganti', async () => {
    const repo = createRepo();
    await new UpdateOrganization(repo).execute(1, { name: 'MAPALA UH' });
    expect(repo.findByNameAndGroup).toHaveBeenCalledWith('MAPALA UH', 'work_organization');
  });

  it('group tidak berubah walau dikirim di payload update', async () => {
    const repo = createRepo();
    await new UpdateOrganization(repo).execute(1, { name: 'MAPALA UH', group: 'education' });
    expect(repo.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ group: 'work_organization' })
    );
  });

  it('melempar ConflictError kalau nama baru sudah dipakai', async () => {
    const repo = createRepo({ findByNameAndGroup: jest.fn().mockResolvedValue({ id: 9 }) });
    await expect(new UpdateOrganization(repo).execute(1, { name: 'Lain' })).rejects.toThrow(
      ConflictError
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('melempar NotFoundError kalau organisasi tidak ada', async () => {
    const repo = createRepo({ findById: jest.fn().mockResolvedValue(null) });
    await expect(new UpdateOrganization(repo).execute(99, { name: 'x' })).rejects.toThrow(
      NotFoundError
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau update gagal', async () => {
    const repo = createRepo({ update: jest.fn().mockRejectedValue(new Error('DB error')) });
    await expect(new UpdateOrganization(repo).execute(1, { location: 'x' })).rejects.toThrow(
      'DB error'
    );
  });
});

describe('DeleteOrganization use-case', () => {
  it('menghapus organisasi yang ada', async () => {
    const repo = createRepo();
    await new DeleteOrganization(repo).execute(1);
    expect(repo.delete).toHaveBeenCalledWith(1);
  });

  it('melempar NotFoundError dan tidak menghapus kalau organisasi tidak ada', async () => {
    const repo = createRepo({ findById: jest.fn().mockResolvedValue(null) });
    await expect(new DeleteOrganization(repo).execute(99)).rejects.toThrow(NotFoundError);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau delete gagal', async () => {
    const repo = createRepo({ delete: jest.fn().mockRejectedValue(new Error('DB error')) });
    await expect(new DeleteOrganization(repo).execute(1)).rejects.toThrow('DB error');
  });
});
