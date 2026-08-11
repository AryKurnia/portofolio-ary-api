const UpdateSocialMedia = require('./UpdateSocialMedia');
const NotFoundError = require('../../exceptions/NotFoundError');

describe('UpdateSocialMedia use-case', () => {
  const existingSocialMedia = {
    id: 1,
    platform: 'instagram',
    url: 'https://www.instagram.com/aryk922/',
    username: 'Ary Kurnia',
    enabled: true,
  }
  const updatedSocialMedia = {
    url: 'https://www.instagram.com/updated/',
    username: 'Updated Ary Kurnia',
    enabled: false,
  }

  it('mengupdate social media yang ada berdasarkan platform', async () => {
    // ARRANGE
    const mockSocialMediaRepository = {
      findByPlatform: jest.fn().mockResolvedValue(existingSocialMedia),
      update: jest.fn().mockResolvedValue({
        ...existingSocialMedia,
        ...updatedSocialMedia
      }),
    }

    // ACT
    const updateSocialMedia = new UpdateSocialMedia(mockSocialMediaRepository);
    const result = await updateSocialMedia.execute('instagram', {
      ...updatedSocialMedia
    });

    // ASSERT
    expect(mockSocialMediaRepository.findByPlatform).toHaveBeenCalledWith('instagram');
    expect(mockSocialMediaRepository.update).toHaveBeenCalledWith('instagram', expect.objectContaining({
      ...updatedSocialMedia
    }));
    expect(result).toEqual({
      ...existingSocialMedia,
      ...updatedSocialMedia
    });
  })

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

  it('melempar error NotFoundError kalau social media tidak ditemukan', async () => {
    // ARRANGE
    const mockSocialMediaRepository = {
      findByPlatform: jest.fn().mockResolvedValue(null),
    }

    // ACT
    const updateSocialMedia = new UpdateSocialMedia(mockSocialMediaRepository);
    const result = updateSocialMedia.execute('nonexistent', {
      ...updatedSocialMedia
    });

    // ASSERT
    expect(mockSocialMediaRepository.findByPlatform).toHaveBeenCalledWith('nonexistent');
    await expect(result).rejects.toThrow(NotFoundError);
  })

  it('melempar error kalau repository gagal', async () => {
    // ARRANGE
    const mockSocialMediaRepository = {
      findByPlatform: jest.fn().mockRejectedValue(new Error('DB error')),
    }

    // ACT
    const updateSocialMedia = new UpdateSocialMedia(mockSocialMediaRepository);
    const result = updateSocialMedia.execute('instagram', {
      ...updatedSocialMedia
    });

    // ASSERT
    await expect(result).rejects.toThrow('DB error');
  })

  it('melempar error kalau repository.update gagal', async () => {
    // ARRANGE
    const mockSocialMediaRepository = {
      findByPlatform: jest.fn().mockResolvedValue(existingSocialMedia),
      update: jest.fn().mockRejectedValue(new Error('DB error')),
    }

    // ACT
    const updateSocialMedia = new UpdateSocialMedia(mockSocialMediaRepository);
    const result = updateSocialMedia.execute('instagram', {
      ...updatedSocialMedia
    });

    // ASSERT
    await expect(result).rejects.toThrow('DB error');
  })
})