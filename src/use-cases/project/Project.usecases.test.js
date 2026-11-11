const ListProjects = require('./ListProjects');
const GetProject = require('./GetProject');
const CreateProject = require('./CreateProject');
const UpdateProject = require('./UpdateProject');
const DeleteProject = require('./DeleteProject');
const ReorderProjects = require('./ReorderProjects');
const Project = require('../../entities/Project');
const NotFoundError = require('../../exceptions/NotFoundError');
const ValidationError = require('../../exceptions/ValidationError');

const existing = new Project({
  id: 1,
  title: 'FitAI',
  description: 'x',
  imageMediaId: 7,
  linkUrl: 'https://fit.ai',
  sortOrder: 1,
});

const createRepos = ({ project = existing, media = { id: 7, kind: 'project_image' } } = {}) => ({
  projectRepository: {
    findAll: jest
      .fn()
      .mockResolvedValue({ data: [project], meta: { page: 1, limit: 12, total: 1 } }),
    findAllIds: jest.fn().mockResolvedValue([1, 2, 3]),
    findById: jest.fn().mockResolvedValue(project),
    create: jest.fn().mockImplementation(async (p) => ({ ...p, id: 9 })),
    update: jest.fn().mockImplementation(async (id, p) => ({ ...p, id })),
    delete: jest.fn().mockResolvedValue(undefined),
    reorder: jest.fn().mockResolvedValue(undefined),
  },
  mediaRepository: { findById: jest.fn().mockResolvedValue(media) },
});
const createUseCase = (r) => new CreateProject(r.projectRepository, r.mediaRepository);
const updateUseCase = (r) => new UpdateProject(r.projectRepository, r.mediaRepository);
const detailsOf = (promise) => promise.catch((error) => error.details.map((d) => d.field));

describe('ListProjects use-case', () => {
  it('memakai page=1 dan limit=12 secara default', async () => {
    const r = createRepos();
    await new ListProjects(r.projectRepository).execute();
    expect(r.projectRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 12 });
  });

  it('meneruskan page dan limit custom', async () => {
    const r = createRepos();
    await new ListProjects(r.projectRepository).execute({ page: 2, limit: 6 });
    expect(r.projectRepository.findAll).toHaveBeenCalledWith({ page: 2, limit: 6 });
  });

  it('meneruskan error kalau findAll gagal', async () => {
    const r = createRepos();
    r.projectRepository.findAll.mockRejectedValue(new Error('DB error'));
    await expect(new ListProjects(r.projectRepository).execute()).rejects.toThrow('DB error');
  });
});

describe('GetProject use-case', () => {
  it('mengembalikan project', async () => {
    await expect(new GetProject(createRepos().projectRepository).execute(1)).resolves.toBe(
      existing
    );
  });

  it('melempar NotFoundError kalau project tidak ada', async () => {
    const r = createRepos({ project: null });
    await expect(new GetProject(r.projectRepository).execute(9)).rejects.toThrow(NotFoundError);
  });

  it('meneruskan error kalau findById gagal', async () => {
    const r = createRepos();
    r.projectRepository.findById.mockRejectedValue(new Error('DB error'));
    await expect(new GetProject(r.projectRepository).execute(1)).rejects.toThrow('DB error');
  });
});

describe('CreateProject use-case', () => {
  const input = {
    title: 'Baru',
    description: 'Deskripsi',
    imageMediaId: 7,
    linkUrl: 'https://x.dev',
  };

  it('membuat project terbit dengan tombol aktif karena ada link', async () => {
    const r = createRepos();
    await createUseCase(r).execute(input);
    expect(r.mediaRepository.findById).toHaveBeenCalledWith(7);
    expect(r.projectRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Baru', showButton: true, isPublished: true })
    );
  });

  it('menolak gambar yang tidak ada di tabel media', async () => {
    const r = createRepos({ media: null });
    await expect(detailsOf(createUseCase(r).execute(input))).resolves.toEqual(['image_id']);
    expect(r.projectRepository.create).not.toHaveBeenCalled();
  });

  it('menolak media berjenis lain (mis. foto profil) sebagai gambar project', async () => {
    const r = createRepos({ media: { id: 7, kind: 'profile_photo' } });
    await expect(detailsOf(createUseCase(r).execute(input))).resolves.toEqual(['image_id']);
  });

  it('menolak project terbit tanpa gambar, tanpa mengecek tabel media', async () => {
    const r = createRepos();
    const result = createUseCase(r).execute({ ...input, imageMediaId: undefined });
    await expect(result).rejects.toThrow(ValidationError);
    expect(r.mediaRepository.findById).not.toHaveBeenCalled();
  });

  it('menerima draf tanpa gambar dan tanpa link', async () => {
    const r = createRepos();
    await createUseCase(r).execute({ title: 'Draf', description: 'x', isPublished: false });
    expect(r.projectRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ isPublished: false, showButton: false, imageMediaId: null })
    );
  });

  it('meneruskan error kalau mediaRepository.findById gagal', async () => {
    const r = createRepos();
    r.mediaRepository.findById.mockRejectedValue(new Error('DB error'));
    await expect(createUseCase(r).execute(input)).rejects.toThrow('DB error');
  });

  it('meneruskan error kalau projectRepository.create gagal', async () => {
    const r = createRepos();
    r.projectRepository.create.mockRejectedValue(new Error('DB error'));
    await expect(createUseCase(r).execute(input)).rejects.toThrow('DB error');
  });
});

describe('UpdateProject use-case', () => {
  it('hanya mengubah field yang dikirim', async () => {
    const r = createRepos();
    await updateUseCase(r).execute(1, { title: 'FitAI Coach' });
    expect(r.projectRepository.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        title: 'FitAI Coach',
        linkUrl: 'https://fit.ai',
        imageMediaId: 7,
        sortOrder: 1,
      })
    );
  });

  it('menghapus link tanpa mematikan tombol ditolak (validasi data gabungan)', async () => {
    const r = createRepos();
    await expect(detailsOf(updateUseCase(r).execute(1, { linkUrl: null }))).resolves.toEqual([
      'show_button',
    ]);
    expect(r.projectRepository.update).not.toHaveBeenCalled();
  });

  it('menghapus link sekaligus mematikan tombol diterima', async () => {
    const r = createRepos();
    await updateUseCase(r).execute(1, { linkUrl: null, showButton: false });
    expect(r.projectRepository.update).toHaveBeenCalled();
  });

  it('sort_order tidak berubah walau dikirim di payload update', async () => {
    const r = createRepos();
    await updateUseCase(r).execute(1, { title: 'x', sortOrder: 99 });
    expect(r.projectRepository.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ sortOrder: 1 })
    );
  });

  it('melempar NotFoundError kalau project tidak ada', async () => {
    const r = createRepos({ project: null });
    await expect(updateUseCase(r).execute(9, { title: 'x' })).rejects.toThrow(NotFoundError);
    expect(r.projectRepository.update).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau update gagal', async () => {
    const r = createRepos();
    r.projectRepository.update.mockRejectedValue(new Error('DB error'));
    await expect(updateUseCase(r).execute(1, { title: 'x' })).rejects.toThrow('DB error');
  });
});

describe('DeleteProject use-case', () => {
  it('menghapus project yang ada', async () => {
    const r = createRepos();
    await new DeleteProject(r.projectRepository).execute(1);
    expect(r.projectRepository.delete).toHaveBeenCalledWith(1);
  });

  it('melempar NotFoundError dan tidak menghapus kalau project tidak ada', async () => {
    const r = createRepos({ project: null });
    await expect(new DeleteProject(r.projectRepository).execute(9)).rejects.toThrow(NotFoundError);
    expect(r.projectRepository.delete).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau delete gagal', async () => {
    const r = createRepos();
    r.projectRepository.delete.mockRejectedValue(new Error('DB error'));
    await expect(new DeleteProject(r.projectRepository).execute(1)).rejects.toThrow('DB error');
  });
});

describe('ReorderProjects use-case', () => {
  it('menyimpan urutan bila ids memuat semua project', async () => {
    const r = createRepos();
    await new ReorderProjects(r.projectRepository).execute([3, 1, 2]);
    expect(r.projectRepository.reorder).toHaveBeenCalledWith([3, 1, 2]);
  });

  it('menolak ids yang tidak lengkap', async () => {
    const r = createRepos();
    await expect(new ReorderProjects(r.projectRepository).execute([3, 1])).rejects.toThrow(
      ValidationError
    );
    expect(r.projectRepository.reorder).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau findAllIds gagal', async () => {
    const r = createRepos();
    r.projectRepository.findAllIds.mockRejectedValue(new Error('DB error'));
    await expect(new ReorderProjects(r.projectRepository).execute([1])).rejects.toThrow('DB error');
  });
});
