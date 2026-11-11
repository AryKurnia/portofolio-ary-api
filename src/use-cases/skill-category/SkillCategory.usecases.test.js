const ListSkillCategories = require('./ListSkillCategories');
const CreateSkillCategory = require('./CreateSkillCategory');
const UpdateSkillCategory = require('./UpdateSkillCategory');
const DeleteSkillCategory = require('./DeleteSkillCategory');
const ReorderSkillCategories = require('./ReorderSkillCategories');
const NotFoundError = require('../../exceptions/NotFoundError');
const ConflictError = require('../../exceptions/ConflictError');
const ValidationError = require('../../exceptions/ValidationError');

const categories = [
  { id: 1, name: 'Frontend', sortOrder: 1 },
  { id: 2, name: 'Backend', sortOrder: 2 },
];

const createRepo = (overrides = {}) => ({
  findAll: jest.fn().mockResolvedValue(categories),
  findById: jest.fn().mockResolvedValue(categories[0]),
  findByName: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockImplementation(async (c) => ({ ...c, id: 3 })),
  update: jest.fn().mockImplementation(async (id, c) => ({ ...c, id })),
  delete: jest.fn().mockResolvedValue(undefined),
  reorder: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('ListSkillCategories use-case', () => {
  it('mengembalikan semua kategori', async () => {
    await expect(new ListSkillCategories(createRepo()).execute()).resolves.toEqual(categories);
  });

  it('meneruskan error kalau findAll gagal', async () => {
    const repo = createRepo({ findAll: jest.fn().mockRejectedValue(new Error('DB error')) });
    await expect(new ListSkillCategories(repo).execute()).rejects.toThrow('DB error');
  });
});

describe('CreateSkillCategory use-case', () => {
  it('membuat kategori di urutan paling akhir', async () => {
    const repo = createRepo();
    await new CreateSkillCategory(repo).execute({ name: 'Tools' });
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Tools', sortOrder: 3 })
    );
  });

  it('kategori pertama mendapat sort_order 1', async () => {
    const repo = createRepo({ findAll: jest.fn().mockResolvedValue([]) });
    await new CreateSkillCategory(repo).execute({ name: 'Tools' });
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ sortOrder: 1 }));
  });

  it('melempar ConflictError dan tidak membuat apa pun kalau nama sudah ada', async () => {
    const repo = createRepo({ findByName: jest.fn().mockResolvedValue(categories[0]) });
    await expect(new CreateSkillCategory(repo).execute({ name: 'Frontend' })).rejects.toThrow(
      ConflictError
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau create gagal', async () => {
    const repo = createRepo({ create: jest.fn().mockRejectedValue(new Error('DB error')) });
    await expect(new CreateSkillCategory(repo).execute({ name: 'Tools' })).rejects.toThrow(
      'DB error'
    );
  });

  it('meneruskan error kalau findByName gagal', async () => {
    const repo = createRepo({ findByName: jest.fn().mockRejectedValue(new Error('DB error')) });
    await expect(new CreateSkillCategory(repo).execute({ name: 'Tools' })).rejects.toThrow(
      'DB error'
    );
  });
});

describe('UpdateSkillCategory use-case', () => {
  it('mengganti nama', async () => {
    const repo = createRepo();
    await new UpdateSkillCategory(repo).execute(1, { name: 'Front-end' });
    expect(repo.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ name: 'Front-end', sortOrder: 1 })
    );
  });

  it('menyimpan nama yang sama (milik kategori itu sendiri) tanpa konflik', async () => {
    const repo = createRepo({ findByName: jest.fn().mockResolvedValue(categories[0]) });
    await new UpdateSkillCategory(repo).execute(1, { name: 'Frontend' });
    expect(repo.update).toHaveBeenCalled();
  });

  it('melempar ConflictError kalau nama dipakai kategori lain', async () => {
    const repo = createRepo({ findByName: jest.fn().mockResolvedValue(categories[1]) });
    await expect(new UpdateSkillCategory(repo).execute(1, { name: 'Backend' })).rejects.toThrow(
      ConflictError
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('melempar NotFoundError kalau kategori tidak ada', async () => {
    const repo = createRepo({ findById: jest.fn().mockResolvedValue(null) });
    await expect(new UpdateSkillCategory(repo).execute(9, { name: 'x' })).rejects.toThrow(
      NotFoundError
    );
    expect(repo.findByName).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau update gagal', async () => {
    const repo = createRepo({ update: jest.fn().mockRejectedValue(new Error('DB error')) });
    await expect(new UpdateSkillCategory(repo).execute(1, { name: 'x' })).rejects.toThrow(
      'DB error'
    );
  });
});

describe('DeleteSkillCategory use-case', () => {
  it('menghapus kategori yang ada', async () => {
    const repo = createRepo();
    await new DeleteSkillCategory(repo).execute(1);
    expect(repo.delete).toHaveBeenCalledWith(1);
  });

  it('melempar NotFoundError dan tidak menghapus kalau kategori tidak ada', async () => {
    const repo = createRepo({ findById: jest.fn().mockResolvedValue(null) });
    await expect(new DeleteSkillCategory(repo).execute(9)).rejects.toThrow(NotFoundError);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau delete gagal', async () => {
    const repo = createRepo({ delete: jest.fn().mockRejectedValue(new Error('DB error')) });
    await expect(new DeleteSkillCategory(repo).execute(1)).rejects.toThrow('DB error');
  });
});

describe('ReorderSkillCategories use-case', () => {
  it('menyimpan urutan bila ids lengkap', async () => {
    const repo = createRepo();
    await new ReorderSkillCategories(repo).execute([2, 1]);
    expect(repo.reorder).toHaveBeenCalledWith([2, 1]);
  });

  it('menolak ids yang tidak lengkap', async () => {
    const repo = createRepo();
    await expect(new ReorderSkillCategories(repo).execute([2])).rejects.toThrow(ValidationError);
    expect(repo.reorder).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau reorder gagal', async () => {
    const repo = createRepo({ reorder: jest.fn().mockRejectedValue(new Error('DB error')) });
    await expect(new ReorderSkillCategories(repo).execute([2, 1])).rejects.toThrow('DB error');
  });
});
