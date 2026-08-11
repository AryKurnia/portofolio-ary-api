const ListSocialMedia = require('./ListSocialMedia');

describe('ListSocialMedia use-case', () => {
  it('Meneruskan pemanggilan ke repository.findAll', async () => {
    // ARRANGE
    const mockSocialMediaRepository = {
      findAll: jest.fn().mockResolvedValue({
        data: [
          {
            platform: 'instagram',
            url: 'https://instagram.com/aryk922/',
            username: 'aryk922',
            enabled: true
          },
          {
            platform: 'linkedin',
            url: 'https://www.linkedin.com/in/arykurnia/',
            username: 'Ary Kurnia',
            enabled: true
          },
          {
            platform: 'github',
            url: 'https://github.com/aryk922',
            username: 'aryk922',
            enabled: true
          },
          {
            platform: 'twitter',
            url: 'https://x.com/aryk922',
            username: 'aryk922',
            enabled: false
          }
        ]
      })
    }

    // ACT
    const listSocialMedia = new ListSocialMedia(mockSocialMediaRepository);
    const result = await listSocialMedia.execute();

    // ASSERT
    expect(mockSocialMediaRepository.findAll).toHaveBeenCalled();
    expect(result.data).toHaveLength(4);
  })

  it('Meneruskan error kalau repository gagal', async () => {
    // ARRANGE
    const mockSocialMediaRepository = {
      findAll: jest.fn().mockRejectedValue(new Error('DB error'))
    }

    // ACT
    const listSocialMedia = new ListSocialMedia(mockSocialMediaRepository);

    // ASSERT
    await expect(listSocialMedia.execute()).rejects.toThrow('DB error');
  })
})