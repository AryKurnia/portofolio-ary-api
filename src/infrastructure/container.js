const config = require('../config');
const logger = require('./logger');
const sequelize = require('./db/sequelizeClient');

// Repositories and Storage
// Repositories
const MariaDBUserRepository = require('../repositories/mariadb/MariaDBUserRepository');
const MariaDBSocialMediaRepository = require('../repositories/mariadb/MariaDBSocialMediaRepository');
const MariaDBSkillRepository = require('../repositories/mariadb/MariaDBSkillRepository');
const MariaDBRefreshTokenRepository = require('../repositories/mariadb/MariaDBRefreshTokenRepository');

// Security
const BcryptPasswordHasher = require('./security/BcryptPasswordHasher');
const JwtTokenManager = require('./security/JwtTokenManager');

// File Storage
const minioClient = require('./storage/minioClient');
const MinioFileStorage = require('./storage/MinioFileStorage');
// End Repositories and Storage

// Use-cases
// Health
const CheckHealth = require('../use-cases/health/CheckHealth');

// Auth
const LoginUser = require('../use-cases/auth/LoginUser');
const RefreshAccessToken = require('../use-cases/auth/RefreshAccessToken');
const LogoutUser = require('../use-cases/auth/LogoutUser');
const GetCurrentAdmin = require('../use-cases/auth/GetCurrentAdmin');

// Media Social
const ListSocialMedia = require('../use-cases/social-media/ListSocialMedia');
const GetSocialMediaByPlatform = require('../use-cases/social-media/GetSocialMediaByPlatform');
const UpdateSocialMedia = require('../use-cases/social-media/UpdateSocialMedia');

// Skills
const ListSkills = require('../use-cases/skill/ListSkills');
const GetSkill = require('../use-cases/skill/GetSkill');
const CreateSkill = require('../use-cases/skill/CreateSkill');
const UpdateSkill = require('../use-cases/skill/UpdateSkill');
const DeleteSkill = require('../use-cases/skill/DeleteSkill');
const UploadSkillLogo = require('../use-cases/skill/UploadSkillLogo');
// End Use-cases

const skillRepository = new MariaDBSkillRepository();
const userRepository = new MariaDBUserRepository();
const socialMediaRepository = new MariaDBSocialMediaRepository();
const refreshTokenRepository = new MariaDBRefreshTokenRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenManager = new JwtTokenManager({
  secret: config.jwt.secret,
  audience: config.jwt.audience,
  issuer: config.jwt.issuer,
  accessTokenTtlSeconds: config.jwt.expiresInSeconds,
  refreshTokenTtlSeconds: config.auth.refreshTokenTtlSeconds,
});
const fileStorage = new MinioFileStorage(minioClient, config.minio.bucket, config.minio.publicUrl);

module.exports = {
  // Health
  checkHealth: new CheckHealth({ pingDatabase: () => sequelize.authenticate() }),
  // Auth
  loginUser: new LoginUser(userRepository, refreshTokenRepository, passwordHasher, tokenManager),
  refreshAccessToken: new RefreshAccessToken(refreshTokenRepository, userRepository, tokenManager),
  logoutUser: new LogoutUser(refreshTokenRepository, tokenManager),
  getCurrentAdmin: new GetCurrentAdmin(userRepository),
  // Skills
  listSkills: new ListSkills(skillRepository),
  getSkill: new GetSkill(skillRepository),
  createSkill: new CreateSkill(skillRepository),
  updateSkill: new UpdateSkill(skillRepository),
  deleteSkill: new DeleteSkill(skillRepository, fileStorage, logger),
  uploadSkillLogo: new UploadSkillLogo(skillRepository, fileStorage),
  // Social Media
  listSocialMedia: new ListSocialMedia(socialMediaRepository),
  getSocialMediaByPlatform: new GetSocialMediaByPlatform(socialMediaRepository),
  updateSocialMedia: new UpdateSocialMedia(socialMediaRepository),
};
