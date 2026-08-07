const DeleteSkill = require('./DeleteSkill');
const NotFoundError = require('../../exceptions/NotFoundError');

describe('DeleteSkill use-case', () => {
  const existingSkill = {
    id: 1,
    name: 'Jest',
    logoUrl: 'https://minio.../1.jpg',
    description: 'Testing framework',
    enabled: true,
  };

  it('menghapus skill yang ada', async () => {
    // ARRANGE
    const mockSkillRepository = {
      findById: jest.fn().mockResolvedValue(existingSkill),
      delete: jest.fn().mockResolvedValue(true),
    };
    const mockFileStorage = {
      delete: jest.fn().mockResolvedValue(true),
    };

    // ACT
    await new DeleteSkill(mockSkillRepository, mockFileStorage).execute(1);

    // ASSERT
    expect(mockSkillRepository.findById).toHaveBeenCalledWith(1);
    expect(mockSkillRepository.delete).toHaveBeenCalledWith(1);
  });

  it('menghapus logo dari storage juga saat skill punya logoUrl', async () => {
    // ARRANGE
    const mockSkillRepository = {
      findById: jest.fn().mockResolvedValue(existingSkill),
      delete: jest.fn().mockResolvedValue(true),
    };
    const mockFileStorage = {
      delete: jest.fn().mockResolvedValue(true),
    };

    // ACT
    await new DeleteSkill(mockSkillRepository, mockFileStorage).execute(1);

    // ASSERT
    expect(mockFileStorage.delete).toHaveBeenCalledWith('https://minio.../1.jpg');
  });

  it('tidak memanggil fileStorage.delete kalau skill tidak punya logoUrl', async () => {
    // ARRANGE
    const skillWithoutLogo = { ...existingSkill, logoUrl: null };
    const mockSkillRepository = {
      findById: jest.fn().mockResolvedValue(skillWithoutLogo),
      delete: jest.fn().mockResolvedValue(true),
    };
    const mockFileStorage = {
      delete: jest.fn().mockResolvedValue(true),
    };

    // ACT
    await new DeleteSkill(mockSkillRepository, mockFileStorage).execute(1);

    // ASSERT
    expect(mockFileStorage.delete).not.toHaveBeenCalled();
    expect(mockSkillRepository.delete).toHaveBeenCalledWith(1);
  });

  it('melempar NotFoundError kalau skill tidak ditemukan', async () => {
    // ARRANGE
    const mockSkillRepository = {
      findById: jest.fn().mockResolvedValue(null),
      delete: jest.fn(),
    };
    const mockFileStorage = { delete: jest.fn() };

    // ACT
    const result = new DeleteSkill(mockSkillRepository, mockFileStorage).execute(99);

    // ASSERT
    await expect(result).rejects.toThrow(NotFoundError);
    expect(mockFileStorage.delete).not.toHaveBeenCalled();
    expect(mockSkillRepository.delete).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau fileStorage.delete gagal', async () => {
    // ARRANGE
    const mockSkillRepository = {
      findById: jest.fn().mockResolvedValue(existingSkill),
      delete: jest.fn(),
    };
    const mockFileStorage = {
      delete: jest.fn().mockRejectedValue(new Error('MinIO connection error')),
    };

    // ACT
    const result = new DeleteSkill(mockSkillRepository, mockFileStorage).execute(1);

    // ASSERT
    await expect(result).rejects.toThrow('MinIO connection error');
    // kalau hapus file gagal, jangan lanjut hapus data dari database
    expect(mockSkillRepository.delete).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau repository.delete gagal', async () => {
    // ARRANGE
    const mockSkillRepository = {
      findById: jest.fn().mockResolvedValue(existingSkill),
      delete: jest.fn().mockRejectedValue(new Error('Database connection error')),
    };
    const mockFileStorage = {
      delete: jest.fn().mockResolvedValue(true),
    };

    // ACT
    const result = new DeleteSkill(mockSkillRepository, mockFileStorage).execute(1);

    // ASSERT
    await expect(result).rejects.toThrow('Database connection error');
  });
});