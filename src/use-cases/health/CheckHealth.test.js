const CheckHealth = require('./CheckHealth');

describe('CheckHealth use-case', () => {
  it('mengembalikan status ok kalau database bisa dijangkau', async () => {
    // ARRANGE
    const pingDatabase = jest.fn().mockResolvedValue(undefined);

    // ACT
    const result = await new CheckHealth({ pingDatabase }).execute();

    // ASSERT
    expect(pingDatabase).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: 'ok', database: 'ok' });
  });

  it('mengembalikan status error tanpa melempar kalau database tidak bisa dijangkau', async () => {
    // ARRANGE
    const pingDatabase = jest.fn().mockRejectedValue(new Error('ECONNREFUSED 10.0.0.5:3306'));

    // ACT
    const result = await new CheckHealth({ pingDatabase }).execute();

    // ASSERT — detail error (alamat host) tidak boleh bocor ke respons publik
    expect(result).toEqual({ status: 'error', database: 'unreachable' });
  });
});
