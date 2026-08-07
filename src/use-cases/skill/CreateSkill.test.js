const CreateSkill = require('./CreateSkill');
const Skill = require('../../entities/Skill');

describe('CreateSkill use-case', () => {
  it('membuat entity Skill dan menyimpannya lewat repository', async () => {
    const mockSkillRepository = {
      save: jest.fn().mockResolvedValue({ id: 1, name: 'Node.js', enabled: true }),
    };
    const createSkill = new CreateSkill(mockSkillRepository);

    await createSkill.execute({
      name: 'Node.js',
      logoUrl: 'https://nodejs.org/logo.svg',
      description: 'Runtime JavaScript di server',
      enabled: true,
    });

    expect(mockSkillRepository.save).toHaveBeenCalledWith(expect.any(Skill));
  });

  it('meneruskan field yang benar ke entity Skill sebelum disimpan', async () => {
    const mockSkillRepository = { save: jest.fn().mockResolvedValue({}) };
    const createSkill = new CreateSkill(mockSkillRepository);

    await createSkill.execute({
      name: 'Node.js',
      logoUrl: 'https://nodejs.org/logo.svg',
      description: 'Runtime JavaScript di server',
      enabled: true,
    });

    const savedSkill = mockSkillRepository.save.mock.calls[0][0];
    expect(savedSkill.name).toBe('Node.js');
    expect(savedSkill.logoUrl).toBe('https://nodejs.org/logo.svg');
    expect(savedSkill.enabled).toBe(true);
  });

  it('mengembalikan hasil dari repository.save', async () => {
    const savedResult = { id: 1, name: 'Node.js' };
    const mockSkillRepository = { save: jest.fn().mockResolvedValue(savedResult) };
    const createSkill = new CreateSkill(mockSkillRepository);

    const result = await createSkill.execute({ name: 'Node.js' });

    expect(result).toEqual(savedResult);
  });

  it('meneruskan error kalau repository gagal menyimpan', async () => {
    const mockSkillRepository = {
      save: jest.fn().mockRejectedValue(new Error('DB error')),
    };
    const createSkill = new CreateSkill(mockSkillRepository);

    await expect(createSkill.execute({ name: 'Node.js' })).rejects.toThrow('DB error');
  });
});
