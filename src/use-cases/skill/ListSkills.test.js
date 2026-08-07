const ListSkills = require('./ListSkills');

describe('ListSkills use-case', () => {
  it('meneruskan page dan limit ke repository.findAll', async () => {
    const mockSkillRepository = {
      findAll: jest.fn().mockResolvedValue({
        data: [{ id: 1, name: 'Node.js' }],
        meta: { page: 2, limit: 5, total: 1 },
      }),
    };
    const listSkills = new ListSkills(mockSkillRepository);

    const result = await listSkills.execute({ page: 2, limit: 5 });

    expect(mockSkillRepository.findAll).toHaveBeenCalledWith({ page: 2, limit: 5 });
    expect(result.data).toHaveLength(1);
  });

  it('pakai default page=1 dan limit=10 kalau tidak diisi', async () => {
    const mockSkillRepository = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: { page: 1, limit: 10, total: 0 } }),
    };
    const listSkills = new ListSkills(mockSkillRepository);

    await listSkills.execute();

    expect(mockSkillRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('meneruskan error kalau repository gagal', async () => {
    const mockSkillRepository = {
      findAll: jest.fn().mockRejectedValue(new Error('DB error')),
    };
    const listSkills = new ListSkills(mockSkillRepository);

    await expect(listSkills.execute()).rejects.toThrow('DB error');
  });
});
