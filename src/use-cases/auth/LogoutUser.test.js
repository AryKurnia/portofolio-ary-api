const LogoutUser = require('./LogoutUser');

describe('LogoutUser use-case', () => {
  const storedToken = { id: 10, userId: 1, revokedAt: null };

  const createMocks = ({ token = storedToken } = {}) => ({
    refreshTokenRepository: {
      findByTokenHash: jest.fn().mockResolvedValue(token),
      revoke: jest.fn().mockResolvedValue(undefined),
    },
    tokenManager: { hashRefreshToken: jest.fn().mockReturnValue('hash') },
  });

  const createUseCase = (mocks) => new LogoutUser(mocks.refreshTokenRepository, mocks.tokenManager);

  it('mencabut refresh token yang dikirim', async () => {
    // ARRANGE
    const mocks = createMocks();

    // ACT
    await createUseCase(mocks).execute('refresh-token');

    // ASSERT
    expect(mocks.refreshTokenRepository.findByTokenHash).toHaveBeenCalledWith('hash');
    expect(mocks.refreshTokenRepository.revoke).toHaveBeenCalledWith(10);
  });

  it('tetap berhasil tanpa menyentuh repository kalau tidak ada cookie', async () => {
    // ARRANGE
    const mocks = createMocks();

    // ACT
    await createUseCase(mocks).execute(undefined);

    // ASSERT
    expect(mocks.refreshTokenRepository.findByTokenHash).not.toHaveBeenCalled();
  });

  it('tetap berhasil tanpa revoke kalau token tidak dikenal', async () => {
    // ARRANGE
    const mocks = createMocks({ token: null });

    // ACT
    await createUseCase(mocks).execute('palsu');

    // ASSERT
    expect(mocks.refreshTokenRepository.revoke).not.toHaveBeenCalled();
  });

  it('tidak mencabut ulang token yang sudah dicabut', async () => {
    // ARRANGE
    const mocks = createMocks({ token: { ...storedToken, revokedAt: new Date() } });

    // ACT
    await createUseCase(mocks).execute('refresh-token');

    // ASSERT
    expect(mocks.refreshTokenRepository.revoke).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau findByTokenHash gagal', async () => {
    // ARRANGE
    const mocks = createMocks();
    mocks.refreshTokenRepository.findByTokenHash.mockRejectedValue(new Error('DB error'));

    // ACT
    const result = createUseCase(mocks).execute('refresh-token');

    // ASSERT
    await expect(result).rejects.toThrow('DB error');
  });

  it('meneruskan error kalau revoke gagal', async () => {
    // ARRANGE
    const mocks = createMocks();
    mocks.refreshTokenRepository.revoke.mockRejectedValue(new Error('DB error'));

    // ACT
    const result = createUseCase(mocks).execute('refresh-token');

    // ASSERT
    await expect(result).rejects.toThrow('DB error');
  });
});
