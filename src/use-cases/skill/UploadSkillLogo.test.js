const UploadSkillLogo = require('./UploadSkillLogo');
const NotFoundError = require('../../exceptions/NotFoundError');

describe('UploadSkillLogo use-case', () => {
  const existingSkill = { id: 1, name: 'Node.js', logoUrl: null, enabled: true };

  it('upload logo dan update logoUrl skill', async () => {
    const mockSkillRepository = {
      findById: jest.fn().mockResolvedValue(existingSkill),
      update: jest.fn().mockResolvedValue({ ...existingSkill, logoUrl: 'https://minio.../1.jpg' }),
    };
    const mockFileStorage = {
      upload: jest.fn().mockResolvedValue('https://minio.../1.jpg'),
    };
    const uploadSkillLogo = new UploadSkillLogo(mockSkillRepository, mockFileStorage);

    const result = await uploadSkillLogo.execute({
      id: 1,
      buffer: Buffer.from('fake-image'),
      filename: 'logo.png',
      mimeType: 'image/png',
    });

    expect(mockSkillRepository.findById).toHaveBeenCalledWith(1);
    expect(mockFileStorage.upload).toHaveBeenCalledWith({
      buffer: expect.any(Buffer),
      filename: 'logo.png',
      mimeType: 'image/png',
      folder: 'skills',
    });
    expect(mockSkillRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
      logoUrl: 'https://minio.../1.jpg',
    }));
    expect(result.logoUrl).toBe('https://minio.../1.jpg');
  });

  it('melempar NotFoundError kalau skill tidak ditemukan', async () => {
    const mockSkillRepository = {
      findById: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    };
    const mockFileStorage = { upload: jest.fn() };
    const uploadSkillLogo = new UploadSkillLogo(mockSkillRepository, mockFileStorage);

    await expect(
      uploadSkillLogo.execute({ id: 99, buffer: Buffer.from(''), filename: 'x.png', mimeType: 'image/png' })
    ).rejects.toThrow(NotFoundError);

    // pastikan tidak lanjut upload kalau skill-nya saja tidak ada
    expect(mockFileStorage.upload).not.toHaveBeenCalled();
    expect(mockSkillRepository.update).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau upload ke storage gagal', async () => {
    const mockSkillRepository = {
      findById: jest.fn().mockResolvedValue(existingSkill),
      update: jest.fn(),
    };
    const mockFileStorage = {
      upload: jest.fn().mockRejectedValue(new Error('MinIO connection error')),
    };
    const uploadSkillLogo = new UploadSkillLogo(mockSkillRepository, mockFileStorage);

    await expect(
      uploadSkillLogo.execute({ id: 1, buffer: Buffer.from(''), filename: 'x.png', mimeType: 'image/png' })
    ).rejects.toThrow('MinIO connection error');

    // upload gagal → jangan sampai tetap update repository
    expect(mockSkillRepository.update).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau update repository gagal', async () => {
    const mockSkillRepository = {
      findById: jest.fn().mockResolvedValue(existingSkill),
      update: jest.fn().mockRejectedValue(new Error('DB error')),
    };
    const mockFileStorage = {
      upload: jest.fn().mockResolvedValue('https://minio.../1.jpg'),
    };
    const uploadSkillLogo = new UploadSkillLogo(mockSkillRepository, mockFileStorage);

    await expect(
      uploadSkillLogo.execute({ id: 1, buffer: Buffer.from(''), filename: 'x.png', mimeType: 'image/png' })
    ).rejects.toThrow('DB error');
  });
});
