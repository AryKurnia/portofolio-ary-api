const GetProfile = require('./GetProfile');
const UpdateProfile = require('./UpdateProfile');
const NotFoundError = require('../../exceptions/NotFoundError');

const existingProfile = {
  greeting: "Hi, I'm Ary",
  tagline: 'a developer',
  about: 'Tentang saya',
  projectIntro: 'Intro',
  email: 'admin@example.com',
  photoMediaId: 7,
};

describe('GetProfile use-case', () => {
  it('mengembalikan profile', async () => {
    const repo = { get: jest.fn().mockResolvedValue(existingProfile) };
    await expect(new GetProfile(repo).execute()).resolves.toEqual(existingProfile);
  });

  it('melempar NotFoundError kalau profile belum di-seed', async () => {
    const repo = { get: jest.fn().mockResolvedValue(null) };
    await expect(new GetProfile(repo).execute()).rejects.toThrow(NotFoundError);
  });

  it('meneruskan error kalau repository.get gagal', async () => {
    const repo = { get: jest.fn().mockRejectedValue(new Error('DB error')) };
    await expect(new GetProfile(repo).execute()).rejects.toThrow('DB error');
  });
});

describe('UpdateProfile use-case', () => {
  const createRepo = (profile = existingProfile) => ({
    get: jest.fn().mockResolvedValue(profile),
    update: jest.fn().mockImplementation(async (p) => p),
  });
  const mediaRepo = (media = { id: 99, kind: 'profile_photo' }) => ({
    findById: jest.fn().mockResolvedValue(media),
  });

  it('hanya mengubah field yang dikirim (update parsial per section)', async () => {
    // ARRANGE
    const repo = createRepo();

    // ACT
    const result = await new UpdateProfile(repo, mediaRepo()).execute({ tagline: 'tagline baru' });

    // ASSERT
    expect(repo.update).toHaveBeenCalledWith(
      expect.objectContaining({ ...existingProfile, tagline: 'tagline baru' })
    );
    expect(result.greeting).toBe(existingProfile.greeting);
  });

  it('project_intro boleh dikosongkan dengan null', async () => {
    const repo = createRepo();
    await new UpdateProfile(repo, mediaRepo()).execute({ projectIntro: null });
    expect(repo.update).toHaveBeenCalledWith(expect.objectContaining({ projectIntro: null }));
  });

  it('photoMediaId tidak berubah bila tidak dikirim', async () => {
    const repo = createRepo();
    await new UpdateProfile(repo, mediaRepo()).execute({ greeting: 'Halo' });
    expect(repo.update).toHaveBeenCalledWith(expect.objectContaining({ photoMediaId: 7 }));
  });

  it('mengganti foto dengan media jenis profile_photo', async () => {
    const repo = createRepo();
    const media = mediaRepo();
    await new UpdateProfile(repo, media).execute({ photoMediaId: 99 });
    expect(media.findById).toHaveBeenCalledWith(99);
    expect(repo.update).toHaveBeenCalledWith(expect.objectContaining({ photoMediaId: 99 }));
  });

  it('menghapus foto dengan null tanpa cek tabel media', async () => {
    const repo = createRepo();
    const media = mediaRepo();
    await new UpdateProfile(repo, media).execute({ photoMediaId: null });
    expect(media.findById).not.toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledWith(expect.objectContaining({ photoMediaId: null }));
  });

  it.each([
    ['tidak ada', null],
    ['berjenis lain (gambar project)', { id: 99, kind: 'project_image' }],
  ])('menolak foto yang %s, dengan detail field photo_id', async (_label, found) => {
    const repo = createRepo();
    const error = await new UpdateProfile(repo, mediaRepo(found))
      .execute({ photoMediaId: 99 })
      .catch((e) => e);
    expect(error.details[0].field).toBe('photo_id');
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('melempar NotFoundError dan tidak update kalau profile belum ada', async () => {
    const repo = createRepo(null);
    await expect(new UpdateProfile(repo, mediaRepo()).execute({ greeting: 'x' })).rejects.toThrow(
      NotFoundError
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau repository.get gagal', async () => {
    const repo = createRepo();
    repo.get.mockRejectedValue(new Error('DB error'));
    await expect(new UpdateProfile(repo, mediaRepo()).execute({ greeting: 'x' })).rejects.toThrow(
      'DB error'
    );
  });

  it('meneruskan error kalau repository.update gagal', async () => {
    const repo = createRepo();
    repo.update.mockRejectedValue(new Error('DB error'));
    await expect(new UpdateProfile(repo, mediaRepo()).execute({ greeting: 'x' })).rejects.toThrow(
      'DB error'
    );
  });
});
