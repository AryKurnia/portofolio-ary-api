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

  const createMocks = ({ skill = existingSkill } = {}) => ({
    skillRepository: {
      findById: jest.fn().mockResolvedValue(skill),
      delete: jest.fn().mockResolvedValue(true),
    },
    fileStorage: { delete: jest.fn().mockResolvedValue(true) },
    logger: { warn: jest.fn() },
  });

  const createUseCase = ({ skillRepository, fileStorage, logger }) =>
    new DeleteSkill(skillRepository, fileStorage, logger);

  it('menghapus skill yang ada', async () => {
    // ARRANGE
    const mocks = createMocks();

    // ACT
    await createUseCase(mocks).execute(1);

    // ASSERT
    expect(mocks.skillRepository.findById).toHaveBeenCalledWith(1);
    expect(mocks.skillRepository.delete).toHaveBeenCalledWith(1);
  });

  it('menghapus logo dari storage juga saat skill punya logoUrl', async () => {
    // ARRANGE
    const mocks = createMocks();

    // ACT
    await createUseCase(mocks).execute(1);

    // ASSERT
    expect(mocks.fileStorage.delete).toHaveBeenCalledWith('https://minio.../1.jpg');
  });

  it('menghapus data di database sebelum menghapus logo di storage', async () => {
    // ARRANGE
    const mocks = createMocks();

    // ACT
    await createUseCase(mocks).execute(1);

    // ASSERT
    const repositoryDeleteOrder = mocks.skillRepository.delete.mock.invocationCallOrder[0];
    const storageDeleteOrder = mocks.fileStorage.delete.mock.invocationCallOrder[0];
    expect(repositoryDeleteOrder).toBeLessThan(storageDeleteOrder);
  });

  it('tidak memanggil fileStorage.delete kalau skill tidak punya logoUrl', async () => {
    // ARRANGE
    const mocks = createMocks({ skill: { ...existingSkill, logoUrl: null } });

    // ACT
    await createUseCase(mocks).execute(1);

    // ASSERT
    expect(mocks.fileStorage.delete).not.toHaveBeenCalled();
    expect(mocks.skillRepository.delete).toHaveBeenCalledWith(1);
  });

  it('melempar NotFoundError kalau skill tidak ditemukan', async () => {
    // ARRANGE
    const mocks = createMocks({ skill: null });

    // ACT
    const result = createUseCase(mocks).execute(99);

    // ASSERT
    await expect(result).rejects.toThrow(NotFoundError);
    expect(mocks.skillRepository.delete).not.toHaveBeenCalled();
    expect(mocks.fileStorage.delete).not.toHaveBeenCalled();
  });

  it('meneruskan error dan tidak menghapus logo kalau repository.delete gagal', async () => {
    // ARRANGE
    const mocks = createMocks();
    mocks.skillRepository.delete.mockRejectedValue(new Error('Database connection error'));

    // ACT
    const result = createUseCase(mocks).execute(1);

    // ASSERT
    await expect(result).rejects.toThrow('Database connection error');
    // data masih ada, jadi logonya harus tetap utuh
    expect(mocks.fileStorage.delete).not.toHaveBeenCalled();
  });

  it('tetap berhasil dan mencatat warning kalau fileStorage.delete gagal', async () => {
    // ARRANGE
    const mocks = createMocks();
    const storageError = new Error('MinIO connection error');
    mocks.fileStorage.delete.mockRejectedValue(storageError);

    // ACT
    const result = createUseCase(mocks).execute(1);

    // ASSERT
    await expect(result).resolves.toBeUndefined();
    expect(mocks.skillRepository.delete).toHaveBeenCalledWith(1);
    expect(mocks.logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ err: storageError, skillId: 1 }),
      expect.any(String)
    );
  });
});
