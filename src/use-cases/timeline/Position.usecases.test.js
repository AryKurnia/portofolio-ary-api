const CreatePosition = require('./CreatePosition');
const UpdatePosition = require('./UpdatePosition');
const DeletePosition = require('./DeletePosition');
const ReorderPositions = require('./ReorderPositions');
const Organization = require('../../entities/Organization');
const Position = require('../../entities/Position');
const NotFoundError = require('../../exceptions/NotFoundError');
const ValidationError = require('../../exceptions/ValidationError');

const now = () => new Date('2026-11-11T00:00:00Z');
const organization = new Organization({
  id: 1,
  name: 'MAPALA',
  group: 'work_organization',
  positions: [
    new Position({ id: 10, organizationId: 1, title: 'A', type: 'member', startDate: '2022-01' }),
  ],
});
const validPosition = {
  title: 'Anggota',
  type: 'member',
  startDate: '2022-01',
  endDate: '2025-01',
};

const createRepos = ({
  org = organization,
  byName = null,
  position = organization.positions[0],
} = {}) => ({
  organizationRepository: {
    findById: jest.fn().mockResolvedValue(org),
    findByNameAndGroup: jest.fn().mockResolvedValue(byName),
    create: jest.fn().mockImplementation(async (o) => new Organization({ ...o, id: 5 })),
  },
  positionRepository: {
    findById: jest.fn().mockResolvedValue(position),
    create: jest.fn().mockImplementation(async (p) => ({ ...p, id: 20 })),
    update: jest.fn().mockImplementation(async (id, p) => ({ ...p, id })),
    delete: jest.fn().mockResolvedValue(undefined),
    reorder: jest.fn().mockResolvedValue(undefined),
  },
});

const create = (repos) =>
  new CreatePosition(repos.organizationRepository, repos.positionRepository, { now });
const update = (repos) =>
  new UpdatePosition(repos.organizationRepository, repos.positionRepository, { now });

describe('CreatePosition use-case', () => {
  it('membuat posisi di organisasi yang dipilih lewat organization_id', async () => {
    const repos = createRepos();
    const result = await create(repos).execute({ organizationId: 1, ...validPosition });
    expect(repos.organizationRepository.findById).toHaveBeenCalledWith(1);
    expect(repos.positionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: 1, title: 'Anggota', startDate: '2022-01' })
    );
    expect(repos.organizationRepository.create).not.toHaveBeenCalled();
    expect(result.id).toBe(20);
  });

  it('memakai organisasi yang sudah ada bila nama + grup cocok', async () => {
    const repos = createRepos({ byName: organization });
    await create(repos).execute({
      organizationName: 'MAPALA',
      group: 'work_organization',
      ...validPosition,
    });
    expect(repos.organizationRepository.create).not.toHaveBeenCalled();
    expect(repos.positionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: 1 })
    );
  });

  it('membuat organisasi baru bila nama + grup belum ada', async () => {
    const repos = createRepos();
    await create(repos).execute({
      organizationName: 'Unhas',
      group: 'education',
      ...validPosition,
      type: 'education',
    });
    expect(repos.organizationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Unhas', group: 'education' })
    );
    expect(repos.positionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: 5 })
    );
  });

  it('melempar ValidationError dan TIDAK membuat organisasi baru kalau posisi tidak valid', async () => {
    // ARRANGE — tipe member di grup education melanggar aturan grup↔tipe
    const repos = createRepos();

    // ACT
    const result = create(repos).execute({
      organizationName: 'Unhas',
      group: 'education',
      ...validPosition,
    });

    // ASSERT
    await expect(result).rejects.toThrow(ValidationError);
    expect(repos.organizationRepository.create).not.toHaveBeenCalled();
    expect(repos.positionRepository.create).not.toHaveBeenCalled();
  });

  it('error validasi berisi detail per field', async () => {
    const repos = createRepos();
    const error = await create(repos)
      .execute({ organizationId: 1, ...validPosition, type: 'committee' })
      .catch((e) => e);
    expect(error.details).toEqual([{ field: 'event_name', message: expect.any(String) }]);
  });

  it('melempar NotFoundError kalau organization_id tidak ada', async () => {
    const repos = createRepos({ org: null });
    await expect(create(repos).execute({ organizationId: 99, ...validPosition })).rejects.toThrow(
      NotFoundError
    );
    expect(repos.positionRepository.create).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau organizationRepository.create gagal', async () => {
    const repos = createRepos();
    repos.organizationRepository.create.mockRejectedValue(new Error('DB error'));
    const result = create(repos).execute({
      organizationName: 'X',
      group: 'work_organization',
      ...validPosition,
    });
    await expect(result).rejects.toThrow('DB error');
    expect(repos.positionRepository.create).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau positionRepository.create gagal', async () => {
    const repos = createRepos();
    repos.positionRepository.create.mockRejectedValue(new Error('DB error'));
    await expect(create(repos).execute({ organizationId: 1, ...validPosition })).rejects.toThrow(
      'DB error'
    );
  });

  it('meneruskan error kalau findByNameAndGroup gagal', async () => {
    const repos = createRepos();
    repos.organizationRepository.findByNameAndGroup.mockRejectedValue(new Error('DB error'));
    const result = create(repos).execute({
      organizationName: 'X',
      group: 'work_organization',
      ...validPosition,
    });
    await expect(result).rejects.toThrow('DB error');
  });
});

describe('UpdatePosition use-case', () => {
  const existing = new Position({
    id: 10,
    organizationId: 1,
    title: 'Anggota',
    type: 'member',
    startDate: '2022-01',
    endDate: '2025-01',
  });

  it('hanya mengubah field yang dikirim', async () => {
    const repos = createRepos({ position: existing });
    await update(repos).execute(10, { title: 'Anggota Luar Biasa' });
    expect(repos.positionRepository.update).toHaveBeenCalledWith(
      10,
      expect.objectContaining({
        title: 'Anggota Luar Biasa',
        startDate: '2022-01',
        endDate: '2025-01',
      })
    );
  });

  it('memvalidasi gabungan data lama + perubahan (is_current=true dengan end_date lama ditolak)', async () => {
    const repos = createRepos({ position: existing });
    await expect(update(repos).execute(10, { isCurrent: true })).rejects.toThrow(ValidationError);
    expect(repos.positionRepository.update).not.toHaveBeenCalled();
  });

  it('is_current=true bersama end_date=null diterima', async () => {
    const repos = createRepos({ position: existing });
    await update(repos).execute(10, { isCurrent: true, endDate: null });
    expect(repos.positionRepository.update).toHaveBeenCalledWith(
      10,
      expect.objectContaining({ isCurrent: true, endDate: null })
    );
  });

  it('organizationId tidak berubah walau dikirim di payload update', async () => {
    const repos = createRepos({ position: existing });
    await update(repos).execute(10, { title: 'x', organizationId: 99 });
    expect(repos.positionRepository.update).toHaveBeenCalledWith(
      10,
      expect.objectContaining({ organizationId: 1 })
    );
  });

  it('melempar NotFoundError kalau posisi tidak ada', async () => {
    const repos = createRepos({ position: null });
    await expect(update(repos).execute(99, { title: 'x' })).rejects.toThrow(NotFoundError);
    expect(repos.positionRepository.update).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau positionRepository.update gagal', async () => {
    const repos = createRepos({ position: existing });
    repos.positionRepository.update.mockRejectedValue(new Error('DB error'));
    await expect(update(repos).execute(10, { title: 'x' })).rejects.toThrow('DB error');
  });

  it('meneruskan error kalau organizationRepository.findById gagal', async () => {
    const repos = createRepos({ position: existing });
    repos.organizationRepository.findById.mockRejectedValue(new Error('DB error'));
    await expect(update(repos).execute(10, { title: 'x' })).rejects.toThrow('DB error');
  });
});

describe('DeletePosition use-case', () => {
  it('menghapus posisi yang ada', async () => {
    const repos = createRepos();
    await new DeletePosition(repos.positionRepository).execute(10);
    expect(repos.positionRepository.delete).toHaveBeenCalledWith(10);
  });

  it('melempar NotFoundError kalau posisi tidak ada', async () => {
    const repos = createRepos({ position: null });
    await expect(new DeletePosition(repos.positionRepository).execute(99)).rejects.toThrow(
      NotFoundError
    );
    expect(repos.positionRepository.delete).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau delete gagal', async () => {
    const repos = createRepos();
    repos.positionRepository.delete.mockRejectedValue(new Error('DB error'));
    await expect(new DeletePosition(repos.positionRepository).execute(10)).rejects.toThrow(
      'DB error'
    );
  });
});

describe('ReorderPositions use-case', () => {
  const org = new Organization({
    id: 1,
    group: 'work_organization',
    positions: [{ id: 10 }, { id: 11 }, { id: 12 }],
  });
  const reorder = (repos) =>
    new ReorderPositions(repos.organizationRepository, repos.positionRepository);

  it('menyimpan urutan baru bila ids adalah permutasi lengkap', async () => {
    const repos = createRepos({ org });
    await reorder(repos).execute(1, [12, 10, 11]);
    expect(repos.positionRepository.reorder).toHaveBeenCalledWith(1, [12, 10, 11]);
  });

  it.each([
    ['ada id yang hilang', [12, 10]],
    ['ada id asing', [12, 10, 99]],
    ['ada id ganda', [12, 10, 10]],
  ])('menolak bila %s', async (_label, ids) => {
    const repos = createRepos({ org });
    await expect(reorder(repos).execute(1, ids)).rejects.toThrow(ValidationError);
    expect(repos.positionRepository.reorder).not.toHaveBeenCalled();
  });

  it('melempar NotFoundError kalau organisasi tidak ada', async () => {
    const repos = createRepos({ org: null });
    await expect(reorder(repos).execute(99, [1])).rejects.toThrow(NotFoundError);
  });

  it('meneruskan error kalau reorder gagal', async () => {
    const repos = createRepos({ org });
    repos.positionRepository.reorder.mockRejectedValue(new Error('DB error'));
    await expect(reorder(repos).execute(1, [10, 11, 12])).rejects.toThrow('DB error');
  });
});
