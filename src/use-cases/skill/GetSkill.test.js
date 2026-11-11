const GetSkill = require('./GetSkill');
const NotFoundError = require('../../exceptions/NotFoundError');

describe('GetSkill use-case', () => {
  const existingSkill = {
    id: 1,
    name: 'Jest',
    logoUrl: 'https://minio.../1.jpg',
    description: 'Testing framework',
    enabled: true,
  };

  it('mengembalikan skill yang ada berdasarkan id', async () => {
    // ARRANGE
    const mockSkillRepository = {
      findById: jest.fn().mockResolvedValue(existingSkill),
    };

    // ACT
    const result = await new GetSkill(mockSkillRepository).execute(1);

    // ASSERT
    expect(mockSkillRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(existingSkill);
  });

  it('melempar NotFoundError kalau skill tidak ditemukan', async () => {
    // ARRANGE
    const mockSkillRepository = {
      findById: jest.fn().mockResolvedValue(null),
    };

    // ACT
    const result = new GetSkill(mockSkillRepository).execute(99);

    // ASSERT
    await expect(result).rejects.toThrow(NotFoundError);
  });

  it('meneruskan error kalau repository.findById gagal', async () => {
    // ARRANGE
    const mockSkillRepository = {
      findById: jest.fn().mockRejectedValue(new Error('Database connection error')),
    };

    // ACT
    const result = new GetSkill(mockSkillRepository).execute(1);

    // ASSERT
    await expect(result).rejects.toThrow('Database connection error');
  });
});
