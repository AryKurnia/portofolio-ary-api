const { sequelize, assertTestDatabase } = require('./db');
const MariaDBProfileRepository = require('../../src/repositories/mariadb/MariaDBProfileRepository');
const Profile = require('../../src/entities/Profile');

describe('MariaDBProfileRepository (MariaDB tes)', () => {
  const repository = new MariaDBProfileRepository();
  let original;

  beforeAll(async () => {
    await assertTestDatabase();
    original = await repository.get();
  });

  afterAll(async () => {
    if (original) await repository.update(original);
    await sequelize.close();
  });

  it('membaca profile hasil seed', async () => {
    expect(original).toBeInstanceOf(Profile);
    expect(original.greeting).toBeTruthy();
  });

  it('update menyimpan perubahan termasuk emoji dan null pada project_intro', async () => {
    const updated = await repository.update(
      new Profile({ ...original, about: 'Halo 👋🏽 backend 🚀', projectIntro: null })
    );
    expect(updated.about).toBe('Halo 👋🏽 backend 🚀');
    expect(updated.projectIntro).toBeNull();
    expect(updated.greeting).toBe(original.greeting);
  });
});
