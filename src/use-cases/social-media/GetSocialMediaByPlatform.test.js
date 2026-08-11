const GetSocialMediaByPlatform = require('./GetSocialMediaByPlatform');
const NotFoundError = require('../../exceptions/NotFoundError');

describe('GetSocialMediaByPlatform use-case', () => {
  const existingSocialMedia = {
    id: 1,
    platform: 'instagram',
    url: 'https://www.instagram.com/aryk922/',
    username: 'Ary Kurnia',
    enabled: true,
  };

  it('mengembalikan social media yang ada berdasarkan platform', async () => {
    // ARRANGE
    const mockSocialMediaRepository = {
      findByPlatform: jest.fn().mockResolvedValue(existingSocialMedia),
    };

    // ACT
    const getSocialMediaByPlatform = new GetSocialMediaByPlatform(mockSocialMediaRepository);
    const result = await getSocialMediaByPlatform.execute('instagram');

    // ASSERT
    expect(mockSocialMediaRepository.findByPlatform).toHaveBeenCalledWith('instagram');
    expect(result).toEqual(existingSocialMedia);
  })

  it('melempar error NotFoundError kalau social media tidak ditemukan', async () => {
    // ARRANGE
    const mockSocialMediaRepository = {
      findByPlatform: jest.fn().mockResolvedValue(null),
    };

    // ACT
    const getSocialMediaByPlatform = new GetSocialMediaByPlatform(mockSocialMediaRepository);
    const result = getSocialMediaByPlatform.execute('nonexistent');

    // ASSERT
    expect(mockSocialMediaRepository.findByPlatform).toHaveBeenCalledWith('nonexistent');
    await expect(result).rejects.toThrow(NotFoundError);
  })

  it('melempar error kalau repository gagal', async () => {
    // ARRANGE
    const mockSocialMediaRepository = {
      findByPlatform: jest.fn().mockRejectedValue(new Error('DB error')),
    };

    // ACT
    const getSocialMediaByPlatform = new GetSocialMediaByPlatform(mockSocialMediaRepository);
    const result = getSocialMediaByPlatform.execute('instagram');

    // ASSERT
    await expect(result).rejects.toThrow('DB error');
  })
})