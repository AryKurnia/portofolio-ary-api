// src/infrastructure/container.js
const minioClient = require('./storage/minioClient');

const MariaDBSkillRepository = require('../repositories/mariadb/MariaDBSkillRepository');
const MariaDBUserRepository = require('../repositories/mariadb/MariaDBUserRepository');
const MinioFileStorage = require('./storage/MinioFileStorage');

const ListSkills = require('../use-cases/skill/ListSkills');
const CreateSkill = require('../use-cases/skill/CreateSkill');
const UpdateSkill = require('../use-cases/skill/UpdateSkill');
const DeleteSkill = require('../use-cases/skill/DeleteSkill');
const UploadSkillLogo = require('../use-cases/skill/UploadSkillLogo');
const LoginUser = require('../use-cases/auth/LoginUser');

const skillRepository = new MariaDBSkillRepository();
const userRepository = new MariaDBUserRepository();
const fileStorage = new MinioFileStorage(minioClient, process.env.MINIO_BUCKET, process.env.MINIO_PUBLIC_URL);

module.exports = {
  listSkills: new ListSkills(skillRepository),
  createSkill: new CreateSkill(skillRepository),
  updateSkill: new UpdateSkill(skillRepository),
  deleteSkill: new DeleteSkill(skillRepository, fileStorage),
  uploadSkillLogo: new UploadSkillLogo(skillRepository, fileStorage),
  skillRepository, // dipakai handler untuk findById langsung (GET detail, tidak butuh use-case khusus)
  loginUser: new LoginUser(userRepository, {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresInSeconds: Number(process.env.JWT_EXPIRES_IN_SECONDS),
  }),
};