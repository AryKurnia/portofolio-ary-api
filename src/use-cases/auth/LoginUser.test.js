const LoginUser = require('./LoginUser');
const AuthenticationError = require('../../exceptions/AuthenticationError');

describe('LoginUser use-case', () => {
  const existingUser = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: 'hash-di-db',
  };
  const expiresAt = new Date('2026-11-18T00:00:00Z');

  const createMocks = ({
    user = existingUser,
    passwordValid = true,
    needsRehash = false,
  } = {}) => ({
    userRepository: {
      findByUsername: jest.fn().mockResolvedValue(user),
      updatePasswordHash: jest.fn().mockResolvedValue(undefined),
    },
    refreshTokenRepository: { save: jest.fn().mockResolvedValue({ id: 10 }) },
    passwordHasher: {
      compare: jest.fn().mockResolvedValue(passwordValid),
      needsRehash: jest.fn().mockReturnValue(needsRehash),
      hash: jest.fn().mockResolvedValue('hash-baru'),
    },
    tokenManager: {
      createAccessToken: jest.fn().mockReturnValue({ token: 'access-token', expiresIn: 900 }),
      createRefreshToken: jest
        .fn()
        .mockReturnValue({ token: 'refresh-token', tokenHash: 'hash-refresh', expiresAt }),
    },
  });

  const createUseCase = (mocks) =>
    new LoginUser(
      mocks.userRepository,
      mocks.refreshTokenRepository,
      mocks.passwordHasher,
      mocks.tokenManager
    );

  it('login berhasil: mengembalikan access token, refresh token, dan data admin', async () => {
    // ARRANGE
    const mocks = createMocks();

    // ACT
    const result = await createUseCase(mocks).execute({ username: 'admin', password: 'rahasia' });

    // ASSERT
    expect(mocks.userRepository.findByUsername).toHaveBeenCalledWith('admin');
    expect(mocks.passwordHasher.compare).toHaveBeenCalledWith('rahasia', 'hash-di-db');
    expect(mocks.tokenManager.createAccessToken).toHaveBeenCalledWith(existingUser);
    expect(mocks.refreshTokenRepository.save).toHaveBeenCalledWith({
      userId: 1,
      tokenHash: 'hash-refresh',
      expiresAt,
    });
    expect(result).toEqual({
      accessToken: 'access-token',
      expiresIn: 900,
      refreshToken: 'refresh-token',
      refreshTokenExpiresAt: expiresAt,
      admin: { id: 1, username: 'admin' },
    });
  });

  it('data admin yang dikembalikan tidak memuat hash password', async () => {
    // ACT
    const result = await createUseCase(createMocks()).execute({ username: 'admin', password: 'x' });

    // ASSERT
    expect(JSON.stringify(result)).not.toContain('hash-di-db');
  });

  it('melempar AuthenticationError tapi tetap menjalankan compare kalau username tidak ditemukan', async () => {
    // ARRANGE
    const mocks = createMocks({ user: null, passwordValid: false });

    // ACT
    const result = createUseCase(mocks).execute({ username: 'tidak-ada', password: 'apapun' });

    // ASSERT
    await expect(result).rejects.toThrow(AuthenticationError);
    // compare dengan hash null → durasi respons sama dengan username yang ada (anti-enumerasi)
    expect(mocks.passwordHasher.compare).toHaveBeenCalledWith('apapun', null);
    expect(mocks.tokenManager.createAccessToken).not.toHaveBeenCalled();
    expect(mocks.refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('melempar AuthenticationError dan tidak membuat token kalau password salah', async () => {
    // ARRANGE
    const mocks = createMocks({ passwordValid: false });

    // ACT
    const result = createUseCase(mocks).execute({ username: 'admin', password: 'salah' });

    // ASSERT
    await expect(result).rejects.toThrow('Invalid username or password.');
    expect(mocks.passwordHasher.hash).not.toHaveBeenCalled();
    expect(mocks.tokenManager.createAccessToken).not.toHaveBeenCalled();
    expect(mocks.refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('meng-hash ulang password kalau cost hash lama terlalu rendah', async () => {
    // ARRANGE
    const mocks = createMocks({ needsRehash: true });

    // ACT
    await createUseCase(mocks).execute({ username: 'admin', password: 'rahasia' });

    // ASSERT
    expect(mocks.passwordHasher.hash).toHaveBeenCalledWith('rahasia');
    expect(mocks.userRepository.updatePasswordHash).toHaveBeenCalledWith(1, 'hash-baru');
  });

  it('tidak meng-hash ulang password kalau cost hash sudah cukup', async () => {
    // ARRANGE
    const mocks = createMocks({ needsRehash: false });

    // ACT
    await createUseCase(mocks).execute({ username: 'admin', password: 'rahasia' });

    // ASSERT
    expect(mocks.userRepository.updatePasswordHash).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau repository.findByUsername gagal', async () => {
    // ARRANGE
    const mocks = createMocks();
    mocks.userRepository.findByUsername.mockRejectedValue(new Error('Database connection error'));

    // ACT
    const result = createUseCase(mocks).execute({ username: 'admin', password: 'x' });

    // ASSERT
    await expect(result).rejects.toThrow('Database connection error');
  });

  it('meneruskan error kalau repository.updatePasswordHash gagal', async () => {
    // ARRANGE
    const mocks = createMocks({ needsRehash: true });
    mocks.userRepository.updatePasswordHash.mockRejectedValue(
      new Error('Database connection error')
    );

    // ACT
    const result = createUseCase(mocks).execute({ username: 'admin', password: 'x' });

    // ASSERT
    await expect(result).rejects.toThrow('Database connection error');
    expect(mocks.refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau refreshTokenRepository.save gagal', async () => {
    // ARRANGE
    const mocks = createMocks();
    mocks.refreshTokenRepository.save.mockRejectedValue(new Error('Database connection error'));

    // ACT
    const result = createUseCase(mocks).execute({ username: 'admin', password: 'x' });

    // ASSERT
    await expect(result).rejects.toThrow('Database connection error');
  });
});
