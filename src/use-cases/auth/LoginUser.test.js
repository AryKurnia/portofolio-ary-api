const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');
const LoginUser = require('./LoginUser');
const AuthenticationError = require('../../exceptions/AuthenticationError');

jest.mock('bcrypt');
jest.mock('@hapi/jwt');

describe('LoginUser use-case', () => {
  const existingUser = { id: 1, email: 'aryk922@gmail.com', password: 'hashed-password-di-db' };
  const jwtOptions = { jwtSecret: 'test-secret', jwtExpiresInSeconds: 604800 };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('login berhasil dan mengembalikan accessToken', async () => {
    // ARRANGE
    const mockUserRepository = { findByEmail: jest.fn().mockResolvedValue(existingUser) };
    bcrypt.compare.mockResolvedValue(true);
    Jwt.token.generate.mockReturnValue('fake-jwt-token');

    const loginUser = new LoginUser(mockUserRepository, jwtOptions);

    // ACT
    const result = await loginUser.execute({ email: 'aryk922@gmail.com', password: 'plain-password' });

    // ASSERT
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('aryk922@gmail.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('plain-password', 'hashed-password-di-db');
    expect(Jwt.token.generate).toHaveBeenCalledWith(
      expect.objectContaining({ sub: '1', email: 'aryk922@gmail.com' }),
      expect.objectContaining({ key: 'test-secret', algorithm: 'HS256' }),
      { ttlSec: 604800 }
    );
    expect(result).toEqual({ accessToken: 'fake-jwt-token', expiresIn: 604800 });
  });

  it('melempar AuthenticationError kalau email tidak ditemukan', async () => {
    // ARRANGE
    const mockUserRepository = { findByEmail: jest.fn().mockResolvedValue(null) };
    const loginUser = new LoginUser(mockUserRepository, jwtOptions);

    // ACT
    const result = loginUser.execute({ email: 'tidakada@gmail.com', password: 'apapun' });

    // ASSERT
    await expect(result).rejects.toThrow(AuthenticationError);
    expect(bcrypt.compare).not.toHaveBeenCalled(); // fail-fast, tidak perlu cek password kalau user tidak ada
    expect(Jwt.token.generate).not.toHaveBeenCalled();
  });

  it('melempar AuthenticationError kalau password salah', async () => {
    // ARRANGE
    const mockUserRepository = { findByEmail: jest.fn().mockResolvedValue(existingUser) };
    bcrypt.compare.mockResolvedValue(false);
    const loginUser = new LoginUser(mockUserRepository, jwtOptions);

    // ACT
    const result = loginUser.execute({ email: 'aryk922@gmail.com', password: 'password-salah' });

    // ASSERT
    await expect(result).rejects.toThrow(AuthenticationError);
    expect(Jwt.token.generate).not.toHaveBeenCalled();
  });

  it('meneruskan error kalau repository.findByEmail gagal', async () => {
    // ARRANGE
    const mockUserRepository = { findByEmail: jest.fn().mockRejectedValue(new Error('Database connection error')) };
    const loginUser = new LoginUser(mockUserRepository, jwtOptions);

    // ACT
    const result = loginUser.execute({ email: 'aryk922@gmail.com', password: 'apapun' });

    // ASSERT
    await expect(result).rejects.toThrow('Database connection error');
  });
});