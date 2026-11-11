const GetCurrentAdmin = require('./GetCurrentAdmin');
const UnauthorizedError = require('../../exceptions/UnauthorizedError');

describe('GetCurrentAdmin use-case', () => {
  it('mengembalikan id dan username tanpa hash password', async () => {
    // ARRANGE
    const userRepository = {
      findById: jest.fn().mockResolvedValue({ id: 1, username: 'admin', password: 'hash' }),
    };

    // ACT
    const result = await new GetCurrentAdmin(userRepository).execute(1);

    // ASSERT
    expect(userRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1, username: 'admin' });
  });

  it('melempar UnauthorizedError kalau akun sudah tidak ada', async () => {
    // ARRANGE
    const userRepository = { findById: jest.fn().mockResolvedValue(null) };

    // ACT
    const result = new GetCurrentAdmin(userRepository).execute(1);

    // ASSERT
    await expect(result).rejects.toThrow(UnauthorizedError);
  });

  it('meneruskan error kalau repository.findById gagal', async () => {
    // ARRANGE
    const userRepository = { findById: jest.fn().mockRejectedValue(new Error('DB error')) };

    // ACT
    const result = new GetCurrentAdmin(userRepository).execute(1);

    // ASSERT
    await expect(result).rejects.toThrow('DB error');
  });
});
