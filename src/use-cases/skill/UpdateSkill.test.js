const UpdateSkill = require('./UpdateSkill');
const NotFoundError = require('../../exceptions/NotFoundError');

describe('UpdateSkill use-case', () => {
  const existingSkill = {
    id: 1,
    name: 'Jest',
    logoUrl: 'https://minio.../1.jpg',
    description: 'Testing framework',
    enabled: true,
  }

  it('mengupdate skill dan mengembalikan hasilnya', async () => {
    // ARRANGE
    const mockSkillRepository = {
      findById: jest.fn().mockResolvedValue(existingSkill),
      update: jest.fn().mockResolvedValue({
        ...existingSkill,
        name: 'Updated Jest',
        description: 'Updated Testing framework',
        enabled: false,
      }),
    };

    // ACT
    const result = await new UpdateSkill(mockSkillRepository).execute(1, {
      name: 'Updated Jest',
      description: 'Updated Testing framework',
      enabled: false,
    });

    // ASSERT
    expect(mockSkillRepository.findById).toHaveBeenCalledWith(1);
    expect(mockSkillRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
      name: 'Updated Jest',
      logoUrl: 'https://minio.../1.jpg',
      description: 'Updated Testing framework',
      enabled: false,
    }))
    expect(result).toEqual({
      ...existingSkill,
      name: 'Updated Jest',
      description: 'Updated Testing framework',
      enabled: false,
    });
  })

  it('mempertahankan logoUrl yang sudah ada saat update', async () => {
    // ARRANGE
    const mockSkillRepository = {
      findById: jest.fn().mockResolvedValue(existingSkill),
      update: jest.fn().mockResolvedValue({
        ...existingSkill,
        name: 'Updated Jest',
        description: 'Updated Testing framework',
        enabled: false,
      }),
    };

    // ACT
    const result = await new UpdateSkill(mockSkillRepository).execute(1, {
      name: 'Updated Jest',
      // logoUrl: 'https://minio.../2.jpg',
      description: 'Updated Testing framework',
      enabled: false,
    });

    // ASSERT
    expect(result).toEqual({
      id: 1,
      name: 'Updated Jest',
      logoUrl: 'https://minio.../1.jpg',
      description: 'Updated Testing framework',
      enabled: false,
    });
    expect(mockSkillRepository.findById).toHaveBeenCalledWith(1);
    expect(mockSkillRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
      logoUrl: 'https://minio.../1.jpg',
    }))
  })

  it('melempar NotFoundError kalau skill tidak ditemukan', async () => {
    // ARRANGE
    const mockSkillRepository = {
      findById: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    };

    // ACT
    const result = new UpdateSkill(mockSkillRepository).execute(1, {
      name: 'Updated Jest',
      description: 'Testing framework',
      enabled: true,
    });

    // ASSERT
    await expect(result).rejects.toThrow(NotFoundError);
    expect(mockSkillRepository.update).not.toHaveBeenCalled();
  })

  it('meneruskan error kalau repository.update gagal', async () => {
    // ARRANGE
    const mockSkillRepository = {
      findById: jest.fn().mockResolvedValue(existingSkill),
      update: jest.fn().mockRejectedValue(new Error('Database connection error')),
    }

    // ACT
    const result = new UpdateSkill(mockSkillRepository).execute(1, {
      name: 'Updated Jest',
      description: 'Testing framework',
      enabled: true,
    });

    // ASSERT
    await expect(result).rejects.toThrow('Database connection error');
  })
})

