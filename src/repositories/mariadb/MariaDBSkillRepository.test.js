const sequelize = require('../../infrastructure/db/sequelizeClient');
const SkillModel = require('../../infrastructure/db/models/Skill');
const MariaDBSkillRepository = require('./MariaDBSkillRepository');
const Skill = require('../../entities/Skill');

describe('MariaDBSkillRepository', () => {
  const repository = new MariaDBSkillRepository(SkillModel);

  afterEach(async () => {
    await SkillModel.destroy({ where: {}, truncate: true }); // reset tabel setelah tiap test
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('menyimpan skill baru dan mengembalikannya sebagai entity Skill', async () => {
    const skill = new Skill({ name: 'Node.js', description: 'Runtime JS', enabled: true });

    const result = await repository.save(skill);

    expect(result.id).toBeDefined();
    expect(result.name).toBe('Node.js');
  });
});