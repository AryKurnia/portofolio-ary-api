const RefreshAccessToken = require('./RefreshAccessToken');
const UnauthorizedError = require('../../exceptions/UnauthorizedError');

describe('RefreshAccessToken use-case', () => {
  const now = new Date('2026-11-11T00:00:00Z');
  const user = { id: 1, username: 'admin', password: 'hash' };
  const storedToken = {
    id: 10,
    userId: 1,
    tokenHash: 'hash-lama',
    expiresAt: new Date('2026-11-18T00:00:00Z'),
    revokedAt: null,
  };
  const nextExpiresAt = new Date('2026-11-18T00:00:00Z');

  const createMocks = ({ token = storedToken, foundUser = user, rotated = true } = {}) => ({
    refreshTokenRepository: {
      findByTokenHash: jest.fn().mockResolvedValue(token),
      rotate: jest.fn().mockResolvedValue(rotated),
      revokeAllForUser: jest.fn().mockResolvedValue(undefined),
    },
    userRepository: { findById: jest.fn().mockResolvedValue(foundUser) },
    tokenManager: {
      hashRefreshToken: jest.fn().mockReturnValue('hash-lama'),
      createRefreshToken: jest
        .fn()
        .mockReturnValue({
          token: 'refresh-baru',
          tokenHash: 'hash-baru',
          expiresAt: nextExpiresAt,
        }),
      createAccessToken: jest.fn().mockReturnValue({ token: 'access-baru', expiresIn: 900 }),
    },
  });

  const createUseCase = (mocks) =>
    new RefreshAccessToken(mocks.refreshTokenRepository, mocks.userRepository, mocks.tokenManager, {
      now: () => now,
    });

  it('merotasi refresh token dan mengembalikan access token baru', async () => {
    // ARRANGE
    const mocks = createMocks();

    // ACT
    const result = await createUseCase(mocks).execute('refresh-lama');

    // ASSERT
    expect(mocks.tokenManager.hashRefreshToken).toHaveBeenCalledWith('refresh-lama');
    expect(mocks.refreshTokenRepository.findByTokenHash).toHaveBeenCalledWith('hash-lama');
    expect(mocks.refreshTokenRepository.rotate).toHaveBeenCalledWith({
      oldTokenId: 10,
      userId: 1,
      tokenHash: 'hash-baru',
      expiresAt: nextExpiresAt,
    });
    expect(mocks.tokenManager.createAccessToken).toHaveBeenCalledWith(user);
    expect(result).toEqual({
      accessToken: 'access-baru',
      expiresIn: 900,
      refreshToken: 'refresh-baru',
      refreshTokenExpiresAt: nextExpiresAt,
    });
  });

  it('melempar UnauthorizedError tanpa menyentuh repository kalau cookie kosong', async () => {
    // ARRANGE
    const mocks = createMocks();

    // ACT
    const result = createUseCase(mocks).execute(undefined);

    // ASSERT
    await expect(result).rejects.toThrow(UnauthorizedError);
    expect(mocks.refreshTokenRepository.findByTokenHash).not.toHaveBeenCalled();
  });

  it('melempar UnauthorizedError kalau token tidak dikenal', async () => {
    // ARRANGE
    const mocks = createMocks({ token: null });

    // ACT
    const result = createUseCase(mocks).execute('palsu');

    // ASSERT
    await expect(result).rejects.toThrow('Invalid refresh token.');
    expect(mocks.refreshTokenRepository.rotate).not.toHaveBeenCalled();
  });

  it('mencabut semua sesi user kalau token yang sudah dicabut dipakai lagi', async () => {
    // ARRANGE
    const mocks = createMocks({ token: { ...storedToken, revokedAt: new Date('2026-11-10') } });

    // ACT
    const result = createUseCase(mocks).execute('refresh-lama');

    // ASSERT
    await expect(result).rejects.toThrow('Refresh token has been revoked.');
    expect(mocks.refreshTokenRepository.revokeAllForUser).toHaveBeenCalledWith(1);
    expect(mocks.refreshTokenRepository.rotate).not.toHaveBeenCalled();
    expect(mocks.tokenManager.createAccessToken).not.toHaveBeenCalled();
  });

  it('melempar UnauthorizedError kalau token sudah kedaluwarsa', async () => {
    // ARRANGE
    const mocks = createMocks({ token: { ...storedToken, expiresAt: now } });

    // ACT
    const result = createUseCase(mocks).execute('refresh-lama');

    // ASSERT
    await expect(result).rejects.toThrow('Refresh token has expired.');
    expect(mocks.refreshTokenRepository.rotate).not.toHaveBeenCalled();
  });

  it('melempar UnauthorizedError kalau akun pemilik token sudah tidak ada', async () => {
    // ARRANGE
    const mocks = createMocks({ foundUser: null });

    // ACT
    const result = createUseCase(mocks).execute('refresh-lama');

    // ASSERT
    await expect(result).rejects.toThrow(UnauthorizedError);
    expect(mocks.refreshTokenRepository.rotate).not.toHaveBeenCalled();
  });

  it('melempar UnauthorizedError kalau token sudah dirotasi request lain secara bersamaan', async () => {
    // ARRANGE
    const mocks = createMocks({ rotated: false });

    // ACT
    const result = createUseCase(mocks).execute('refresh-lama');

    // ASSERT
    await expect(result).rejects.toThrow(UnauthorizedError);
    expect(mocks.tokenManager.createAccessToken).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau refreshTokenRepository.findByTokenHash gagal', async () => {
    // ARRANGE
    const mocks = createMocks();
    mocks.refreshTokenRepository.findByTokenHash.mockRejectedValue(new Error('DB error'));

    // ACT
    const result = createUseCase(mocks).execute('refresh-lama');

    // ASSERT
    await expect(result).rejects.toThrow('DB error');
  });

  it('meneruskan error kalau userRepository.findById gagal', async () => {
    // ARRANGE
    const mocks = createMocks();
    mocks.userRepository.findById.mockRejectedValue(new Error('DB error'));

    // ACT
    const result = createUseCase(mocks).execute('refresh-lama');

    // ASSERT
    await expect(result).rejects.toThrow('DB error');
    expect(mocks.refreshTokenRepository.rotate).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau refreshTokenRepository.rotate gagal', async () => {
    // ARRANGE
    const mocks = createMocks();
    mocks.refreshTokenRepository.rotate.mockRejectedValue(new Error('DB error'));

    // ACT
    const result = createUseCase(mocks).execute('refresh-lama');

    // ASSERT
    await expect(result).rejects.toThrow('DB error');
  });

  it('meneruskan error kalau revokeAllForUser gagal saat token dipakai ulang', async () => {
    // ARRANGE
    const mocks = createMocks({ token: { ...storedToken, revokedAt: new Date('2026-11-10') } });
    mocks.refreshTokenRepository.revokeAllForUser.mockRejectedValue(new Error('DB error'));

    // ACT
    const result = createUseCase(mocks).execute('refresh-lama');

    // ASSERT
    await expect(result).rejects.toThrow('DB error');
  });
});
