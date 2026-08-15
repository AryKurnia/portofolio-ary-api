
// Repositories and Storage
// Repositories
const MariaDBUserRepository = require('../repositories/mariadb/MariaDBUserRepository');
const MariaDBSocialMediaRepository = require('../repositories/mariadb/MariaDBSocialMediaRepository');
const MariaDBSkillRepository = require('../repositories/mariadb/MariaDBSkillRepository');

// File Storage
const minioClient = require('./storage/minioClient');
const MinioFileStorage = require('./storage/MinioFileStorage');
// End Repositories and Storage

// Use-cases
// Users
const LoginUser = require('../use-cases/auth/LoginUser');

// Media Social
const ListSocialMedia = require('../use-cases/social-media/ListSocialMedia');
const GetSocialMediaByPlatform = require('../use-cases/social-media/GetSocialMediaByPlatform');
const UpdateSocialMedia = require('../use-cases/social-media/UpdateSocialMedia');

// Skills
const ListSkills = require('../use-cases/skill/ListSkills');
const CreateSkill = require('../use-cases/skill/CreateSkill');
const UpdateSkill = require('../use-cases/skill/UpdateSkill');
const DeleteSkill = require('../use-cases/skill/DeleteSkill');
const UploadSkillLogo = require('../use-cases/skill/UploadSkillLogo');
// End Use-cases

const skillRepository = new MariaDBSkillRepository();
const userRepository = new MariaDBUserRepository();
const socialMediaRepository = new MariaDBSocialMediaRepository();
const fileStorage = new MinioFileStorage(minioClient, process.env.MINIO_BUCKET, process.env.MINIO_PUBLIC_URL);

module.exports = {
  // User Login
  loginUser: new LoginUser(userRepository, {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresInSeconds: Number(process.env.JWT_EXPIRES_IN_SECONDS),
  }),
  // Skills
  listSkills: new ListSkills(skillRepository),
  createSkill: new CreateSkill(skillRepository),
  updateSkill: new UpdateSkill(skillRepository),
  deleteSkill: new DeleteSkill(skillRepository, fileStorage),
  uploadSkillLogo: new UploadSkillLogo(skillRepository, fileStorage),
  skillRepository, // dipakai handler untuk findById langsung (GET detail, tidak butuh use-case khusus)
  // Social Media
  listSocialMedia: new ListSocialMedia(socialMediaRepository),
  getSocialMediaByPlatform: new GetSocialMediaByPlatform(socialMediaRepository),
  updateSocialMedia: new UpdateSocialMedia(socialMediaRepository),
};