const UpdateSocialMedia = require('./UpdateSocialMedia');
const NotFoundError = require('../../exceptions/NotFoundError');

describe('UpdateSocialMedia use-case', () => {
  const existingSocialMedia = {
    id: 1,
    platform: 'instagram',
    url: 'https://www.instagram.com/aryk922/',
    username: 'Ary Kurnia',
    enabled: true,
  };
  const updatedSocialMedia = {
    url: 'https://www.instagram.com/updated/',
    username: 'Updated Ary Kurnia',
    enabled: false,
  };

  it('mengupdate social media yang ada berdasarkan platform', async () => {
    // ARRANGE
    const mockSocialMediaRepository = {
      findByPlatform: jest.fn().mockResolvedValue(existingSocialMedia),
      update: jest.fn().mockResolvedValue({
        ...existingSocialMedia,
        ...updatedSocialMedia,
      }),
    };

    // ACT
    const updateSocialMedia = new UpdateSocialMedia(mockSocialMediaRepository);
    const result = await updateSocialMedia.execute('instagram', {
      ...updatedSocialMedia,
    });

    // ASSERT
    expect(mockSocialMediaRepository.findByPlatform).toHaveBeenCalledWith('instagram');
    expect(mockSocialMediaRepository.update).toHaveBeenCalledWith(
      'instagram',
      expect.objectContaining({
        ...updatedSocialMedia,
      })
    );
    expect(result).toEqual({
      ...existingSocialMedia,
      ...updatedSocialMedia,
    });
  });

  it('platform tidak berubah walau dikirim di payload update', async () => {
    // ARRANGE
    const mockSocialMediaRepository = {
      findByPlatform: jest.fn().mockResolvedValue(existingSocialMedia),
      update: jest.fn().mockResolvedValue({ ...existingSocialMedia, ...updatedSocialMedia }),
    };

    // ACT — sengaja kirim platform lain di payload, mencoba "menipu"
    const updateSocialMedia = new UpdateSocialMedia(mockSocialMediaRepository);
    await updateSocialMedia.execute('instagram', {
      ...updatedSocialMedia,
      platform: 'inigram',
    });

    // ASSERT — platform yang dikirim ke repository harus tetap 'instagram', bukan 'inigram'
    expect(mockSocialMediaRepository.update).toHaveBeenCalledWith(
      'instagram',
      expect.objectContaining({ platform: 'instagram' })
    );
  });

  it('enabled tetap false kalau tidak dikirim di payload update', async () => {
    // ARRANGE
    const disabledSocialMedia = { ...existingSocialMedia, enabled: false };
    const mockSocialMediaRepository = {
      findByPlatform: jest.fn().mockResolvedValue(disabledSocialMedia),
      update: jest.fn().mockResolvedValue(disabledSocialMedia),
    };

    // ACT — hanya url yang dikirim, enabled tidak disebut
    const updateSocialMedia = new UpdateSocialMedia(mockSocialMediaRepository);
    await updateSocialMedia.execute('instagram', { url: 'https://www.instagram.com/baru/' });

    // ASSERT — enabled tidak boleh kembali ke default true dari entity
    expect(mockSocialMediaRepository.update).toHaveBeenCalledWith(
      'instagram',
      expect.objectContaining({ url: 'https://www.instagram.com/baru/', enabled: false })
    );
  });

  it('url dan username tetap dari data lama kalau tidak dikirim di payload update', async () => {
    // ARRANGE
    const mockSocialMediaRepository = {
      findByPlatform: jest.fn().mockResolvedValue(existingSocialMedia),
      update: jest.fn().mockResolvedValue({ ...existingSocialMedia, enabled: false }),
    };

    // ACT — hanya enabled yang dikirim
    const updateSocialMedia = new UpdateSocialMedia(mockSocialMediaRepository);
    await updateSocialMedia.execute('instagram', { enabled: false });

    // ASSERT
    expect(mockSocialMediaRepository.update).toHaveBeenCalledWith(
      'instagram',
      expect.objectContaining({
        url: existingSocialMedia.url,
        username: existingSocialMedia.username,
        enabled: false,
      })
    );
  });

  it('melempar error NotFoundError kalau social media tidak ditemukan', async () => {
    // ARRANGE
    const mockSocialMediaRepository = {
      findByPlatform: jest.fn().mockResolvedValue(null),
    };

    // ACT
    const updateSocialMedia = new UpdateSocialMedia(mockSocialMediaRepository);
    const result = updateSocialMedia.execute('nonexistent', {
      ...updatedSocialMedia,
    });

    // ASSERT
    expect(mockSocialMediaRepository.findByPlatform).toHaveBeenCalledWith('nonexistent');
    await expect(result).rejects.toThrow(NotFoundError);
  });

  it('melempar error kalau repository gagal', async () => {
    // ARRANGE
    const mockSocialMediaRepository = {
      findByPlatform: jest.fn().mockRejectedValue(new Error('DB error')),
    };

    // ACT
    const updateSocialMedia = new UpdateSocialMedia(mockSocialMediaRepository);
    const result = updateSocialMedia.execute('instagram', {
      ...updatedSocialMedia,
    });

    // ASSERT
    await expect(result).rejects.toThrow('DB error');
  });

  it('melempar error kalau repository.update gagal', async () => {
    // ARRANGE
    const mockSocialMediaRepository = {
      findByPlatform: jest.fn().mockResolvedValue(existingSocialMedia),
      update: jest.fn().mockRejectedValue(new Error('DB error')),
    };

    // ACT
    const updateSocialMedia = new UpdateSocialMedia(mockSocialMediaRepository);
    const result = updateSocialMedia.execute('instagram', {
      ...updatedSocialMedia,
    });

    // ASSERT
    await expect(result).rejects.toThrow('DB error');
  });
});
