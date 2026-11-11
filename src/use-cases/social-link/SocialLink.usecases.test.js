const ListSocialLinks = require('./ListSocialLinks');
const CreateSocialLink = require('./CreateSocialLink');
const UpdateSocialLink = require('./UpdateSocialLink');
const DeleteSocialLink = require('./DeleteSocialLink');
const ReorderSocialLinks = require('./ReorderSocialLinks');
const NotFoundError = require('../../exceptions/NotFoundError');
const ValidationError = require('../../exceptions/ValidationError');

const links = [
  {
    id: 1,
    platform: 'github',
    label: null,
    url: 'https://github.com/a',
    isPublished: true,
    sortOrder: 1,
  },
  { id: 2, platform: 'x', label: null, url: 'https://x.com/a', isPublished: false, sortOrder: 2 },
];
const createDeps = ({ link = links[0] } = {}) => ({
  socialLinkRepository: {
    findAll: jest.fn().mockResolvedValue(links),
    findById: jest.fn().mockResolvedValue(link),
    create: jest.fn().mockImplementation(async (l) => ({ ...l, id: 3 })),
    update: jest.fn().mockImplementation(async (id, l) => ({ ...l, id })),
    delete: jest.fn().mockResolvedValue(undefined),
    reorder: jest.fn().mockResolvedValue(undefined),
  },
});

describe('Social link use-cases', () => {
  it('ListSocialLinks mengembalikan semua (termasuk yang tidak terbit)', async () => {
    const deps = createDeps();
    await expect(new ListSocialLinks(deps).execute()).resolves.toEqual(links);
    expect(deps.socialLinkRepository.findAll).toHaveBeenCalledWith();
  });

  it('CreateSocialLink menaruh link baru di urutan terakhir', async () => {
    const deps = createDeps();
    await new CreateSocialLink(deps).execute({ platform: 'discord', url: 'https://discord.gg/a' });
    expect(deps.socialLinkRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ platform: 'discord', sortOrder: 3, isPublished: true, label: null })
    );
  });

  it('UpdateSocialLink hanya mengubah field yang dikirim; label boleh dikosongkan', async () => {
    const deps = createDeps({ link: { ...links[0], label: 'Kode saya' } });
    await new UpdateSocialLink(deps).execute(1, { label: null });
    expect(deps.socialLinkRepository.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ label: null, url: 'https://github.com/a', sortOrder: 1 })
    );
  });

  it('UpdateSocialLink & DeleteSocialLink melempar NotFoundError bila link tidak ada', async () => {
    const deps = createDeps({ link: null });
    await expect(new UpdateSocialLink(deps).execute(9, { url: 'https://a.b' })).rejects.toThrow(
      NotFoundError
    );
    await expect(new DeleteSocialLink(deps).execute(9)).rejects.toThrow(NotFoundError);
    expect(deps.socialLinkRepository.delete).not.toHaveBeenCalled();
  });

  it('DeleteSocialLink menghapus link yang ada', async () => {
    const deps = createDeps();
    await new DeleteSocialLink(deps).execute(1);
    expect(deps.socialLinkRepository.delete).toHaveBeenCalledWith(1);
  });

  it('ReorderSocialLinks wajib permutasi lengkap', async () => {
    const deps = createDeps();
    await new ReorderSocialLinks(deps).execute([2, 1]);
    expect(deps.socialLinkRepository.reorder).toHaveBeenCalledWith([2, 1]);
    await expect(new ReorderSocialLinks(deps).execute([2])).rejects.toThrow(ValidationError);
  });

  it('meneruskan error kalau repository gagal', async () => {
    const deps = createDeps();
    deps.socialLinkRepository.create.mockRejectedValue(new Error('DB error'));
    await expect(
      new CreateSocialLink(deps).execute({ platform: 'x', url: 'https://x.com/a' })
    ).rejects.toThrow('DB error');
  });
});
