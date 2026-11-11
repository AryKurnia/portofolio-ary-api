const ListSkills = require('./ListSkills');
const GetSkill = require('./GetSkill');
const CreateSkill = require('./CreateSkill');
const UpdateSkill = require('./UpdateSkill');
const DeleteSkill = require('./DeleteSkill');
const ReorderSkills = require('./ReorderSkills');
const Skill = require('../../entities/Skill');
const NotFoundError = require('../../exceptions/NotFoundError');
const ConflictError = require('../../exceptions/ConflictError');
const ValidationError = require('../../exceptions/ValidationError');

const existing = new Skill({ id: 1, categoryId: 1, name: 'Node.js', logoMediaId: 5, sortOrder: 2 });

const createDeps = ({
  skill = existing,
  media = { id: 5, kind: 'skill_logo' },
  duplicate = null,
} = {}) => ({
  skillRepository: {
    findAll: jest
      .fn()
      .mockResolvedValue([
        existing,
        new Skill({ id: 2, categoryId: 1, name: 'hapi', sortOrder: 3 }),
      ]),
    findById: jest.fn().mockResolvedValue(skill),
    findByCategoryAndName: jest.fn().mockResolvedValue(duplicate),
    create: jest.fn().mockImplementation(async (s) => ({ ...s, id: 9 })),
    update: jest.fn().mockImplementation(async (id, s) => ({ ...s, id })),
    delete: jest.fn().mockResolvedValue(undefined),
    reorder: jest.fn().mockResolvedValue(undefined),
  },
  skillCategoryRepository: { findById: jest.fn().mockResolvedValue({ id: 1, name: 'Backend' }) },
  mediaRepository: { findById: jest.fn().mockResolvedValue(media) },
});
const fieldsOf = (promise) => promise.catch((error) => error.details.map((d) => d.field));

describe('ListSkills & GetSkill use-case', () => {
  it('ListSkills meneruskan filter kategori', async () => {
    const deps = createDeps();
    await new ListSkills(deps).execute({ categoryId: 2 });
    expect(deps.skillRepository.findAll).toHaveBeenCalledWith({ categoryId: 2 });
  });

  it('GetSkill melempar NotFoundError bila tidak ada', async () => {
    await expect(new GetSkill(createDeps({ skill: null })).execute(9)).rejects.toThrow(
      NotFoundError
    );
  });
});

describe('CreateSkill use-case', () => {
  const input = { categoryId: 1, name: 'Express', logoMediaId: 5 };

  it('membuat skill terbit di urutan terakhir kategorinya', async () => {
    const deps = createDeps();
    await new CreateSkill(deps).execute(input);
    expect(deps.skillRepository.findAll).toHaveBeenCalledWith({ categoryId: 1 });
    expect(deps.skillRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Express', isPublished: true, sortOrder: 4 })
    );
  });

  it('menolak skill terbit tanpa logo', async () => {
    const deps = createDeps();
    await expect(
      fieldsOf(new CreateSkill(deps).execute({ categoryId: 1, name: 'Express' }))
    ).resolves.toEqual(['logo_id']);
    expect(deps.skillRepository.create).not.toHaveBeenCalled();
  });

  it('menerima skill belum terbit tanpa logo', async () => {
    const deps = createDeps();
    await new CreateSkill(deps).execute({ categoryId: 1, name: 'Express', isPublished: false });
    expect(deps.skillRepository.create).toHaveBeenCalled();
  });

  it.each([
    ['kategori tidak ada', { categoryMissing: true }, ['category_id']],
    ['logo tidak ada', { media: null }, ['logo_id']],
    ['logo berjenis lain', { media: { id: 5, kind: 'project_image' } }, ['logo_id']],
  ])('menolak bila %s', async (_label, options, fields) => {
    const deps = createDeps(options);
    if (options.categoryMissing) deps.skillCategoryRepository.findById.mockResolvedValue(null);
    await expect(fieldsOf(new CreateSkill(deps).execute(input))).resolves.toEqual(fields);
    expect(deps.skillRepository.create).not.toHaveBeenCalled();
  });

  it('melempar ConflictError bila nama sudah ada di kategori itu', async () => {
    const deps = createDeps({ duplicate: existing });
    await expect(new CreateSkill(deps).execute({ ...input, name: 'Node.js' })).rejects.toThrow(
      ConflictError
    );
    expect(deps.skillRepository.create).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau create gagal', async () => {
    const deps = createDeps();
    deps.skillRepository.create.mockRejectedValue(new Error('DB error'));
    await expect(new CreateSkill(deps).execute(input)).rejects.toThrow('DB error');
  });
});

describe('UpdateSkill use-case', () => {
  it('hanya mengubah field yang dikirim dan mempertahankan urutan', async () => {
    const deps = createDeps();
    await new UpdateSkill(deps).execute(1, { name: 'Node' });
    expect(deps.skillRepository.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ name: 'Node', logoMediaId: 5, sortOrder: 2 })
    );
  });

  it('nama sendiri tidak dianggap duplikat', async () => {
    const deps = createDeps({ duplicate: existing });
    await new UpdateSkill(deps).execute(1, { name: 'Node.js' });
    expect(deps.skillRepository.update).toHaveBeenCalled();
  });

  it('pindah kategori → ditaruh di urutan terakhir kategori baru', async () => {
    const deps = createDeps();
    await new UpdateSkill(deps).execute(1, { categoryId: 2 });
    expect(deps.skillRepository.findAll).toHaveBeenCalledWith({ categoryId: 2 });
    expect(deps.skillRepository.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ categoryId: 2, sortOrder: 4 })
    );
  });

  it('menghapus logo pada skill terbit ditolak (validasi data gabungan)', async () => {
    const deps = createDeps();
    await expect(
      fieldsOf(new UpdateSkill(deps).execute(1, { logoMediaId: null }))
    ).resolves.toEqual(['logo_id']);
  });

  it('melempar NotFoundError bila skill tidak ada', async () => {
    const deps = createDeps({ skill: null });
    await expect(new UpdateSkill(deps).execute(9, { name: 'x' })).rejects.toThrow(NotFoundError);
    expect(deps.skillRepository.update).not.toHaveBeenCalled();
  });
});

describe('DeleteSkill use-case', () => {
  it('menghapus skill (logo dibersihkan job media yatim, bukan di sini)', async () => {
    const deps = createDeps();
    await new DeleteSkill(deps).execute(1);
    expect(deps.skillRepository.delete).toHaveBeenCalledWith(1);
  });

  it('melempar NotFoundError bila tidak ada', async () => {
    const deps = createDeps({ skill: null });
    await expect(new DeleteSkill(deps).execute(9)).rejects.toThrow(NotFoundError);
    expect(deps.skillRepository.delete).not.toHaveBeenCalled();
  });
});

describe('ReorderSkills use-case', () => {
  it('menyimpan urutan di dalam kategori', async () => {
    const deps = createDeps();
    await new ReorderSkills(deps).execute(1, [2, 1]);
    expect(deps.skillRepository.findAll).toHaveBeenCalledWith({ categoryId: 1 });
    expect(deps.skillRepository.reorder).toHaveBeenCalledWith(1, [2, 1]);
  });

  it('menolak ids yang tidak lengkap', async () => {
    const deps = createDeps();
    await expect(new ReorderSkills(deps).execute(1, [2])).rejects.toThrow(ValidationError);
  });

  it('melempar NotFoundError bila kategori tidak ada', async () => {
    const deps = createDeps();
    deps.skillCategoryRepository.findById.mockResolvedValue(null);
    await expect(new ReorderSkills(deps).execute(9, [1])).rejects.toThrow(NotFoundError);
    expect(deps.skillRepository.reorder).not.toHaveBeenCalled();
  });
});
