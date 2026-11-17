const config = require('../config');
const logger = require('./logger');
const sequelize = require('./db/sequelizeClient');

// Repositories and Storage
// Repositories
const MariaDBUserRepository = require('../repositories/mariadb/MariaDBUserRepository');
const MariaDBSocialLinkRepository = require('../repositories/mariadb/MariaDBSocialLinkRepository');
const MariaDBSkillRepository = require('../repositories/mariadb/MariaDBSkillRepository');
const MariaDBRefreshTokenRepository = require('../repositories/mariadb/MariaDBRefreshTokenRepository');
const MariaDBProfileRepository = require('../repositories/mariadb/MariaDBProfileRepository');
const MariaDBOrganizationRepository = require('../repositories/mariadb/MariaDBOrganizationRepository');
const MariaDBPositionRepository = require('../repositories/mariadb/MariaDBPositionRepository');
const MariaDBSkillCategoryRepository = require('../repositories/mariadb/MariaDBSkillCategoryRepository');
const MariaDBProjectRepository = require('../repositories/mariadb/MariaDBProjectRepository');
const MariaDBMediaRepository = require('../repositories/mariadb/MariaDBMediaRepository');
const MariaDBCertificateRepository = require('../repositories/mariadb/MariaDBCertificateRepository');

// Security
const BcryptPasswordHasher = require('./security/BcryptPasswordHasher');
const JwtTokenManager = require('./security/JwtTokenManager');

// Media
const SharpImageProcessor = require('./media/SharpImageProcessor');

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

// Profile
const GetProfile = require('../use-cases/profile/GetProfile');
const UpdateProfile = require('../use-cases/profile/UpdateProfile');

// Timeline
const ListOrganizations = require('../use-cases/timeline/ListOrganizations');
const CreateOrganization = require('../use-cases/timeline/CreateOrganization');
const UpdateOrganization = require('../use-cases/timeline/UpdateOrganization');
const DeleteOrganization = require('../use-cases/timeline/DeleteOrganization');
const CreatePosition = require('../use-cases/timeline/CreatePosition');
const UpdatePosition = require('../use-cases/timeline/UpdatePosition');
const DeletePosition = require('../use-cases/timeline/DeletePosition');
const ReorderPositions = require('../use-cases/timeline/ReorderPositions');

// Skill categories
const ListSkillCategories = require('../use-cases/skill-category/ListSkillCategories');
const CreateSkillCategory = require('../use-cases/skill-category/CreateSkillCategory');
const UpdateSkillCategory = require('../use-cases/skill-category/UpdateSkillCategory');
const DeleteSkillCategory = require('../use-cases/skill-category/DeleteSkillCategory');
const ReorderSkillCategories = require('../use-cases/skill-category/ReorderSkillCategories');

// Projects
const ListProjects = require('../use-cases/project/ListProjects');
const GetProject = require('../use-cases/project/GetProject');
const CreateProject = require('../use-cases/project/CreateProject');
const UpdateProject = require('../use-cases/project/UpdateProject');
const DeleteProject = require('../use-cases/project/DeleteProject');
const ReorderProjects = require('../use-cases/project/ReorderProjects');

// Public (halaman portofolio)
const ListPublishedProjects = require('../use-cases/public/ListPublishedProjects');
const GetPublishedProject = require('../use-cases/public/GetPublishedProject');
const GetTimeline = require('../use-cases/public/GetTimeline');
const ListPublicSocialLinks = require('../use-cases/public/ListPublicSocialLinks');
const GetPortfolio = require('../use-cases/public/GetPortfolio');
const ListPublishedCertificates = require('../use-cases/public/ListPublishedCertificates');

// Media (upload gambar)
const UploadMedia = require('../use-cases/media/UploadMedia');
const DeleteMedia = require('../use-cases/media/DeleteMedia');
const CleanupOrphanMedia = require('../use-cases/media/CleanupOrphanMedia');

// Skills
const ListSkills = require('../use-cases/skill/ListSkills');
const GetSkill = require('../use-cases/skill/GetSkill');
const CreateSkill = require('../use-cases/skill/CreateSkill');
const UpdateSkill = require('../use-cases/skill/UpdateSkill');
const DeleteSkill = require('../use-cases/skill/DeleteSkill');
const ReorderSkills = require('../use-cases/skill/ReorderSkills');
const ListPublishedSkills = require('../use-cases/public/ListPublishedSkills');

// Social links
const ListSocialLinks = require('../use-cases/social-link/ListSocialLinks');
const CreateSocialLink = require('../use-cases/social-link/CreateSocialLink');
const UpdateSocialLink = require('../use-cases/social-link/UpdateSocialLink');
const DeleteSocialLink = require('../use-cases/social-link/DeleteSocialLink');
const ReorderSocialLinks = require('../use-cases/social-link/ReorderSocialLinks');

// Certificates
const ListCertificates = require('../use-cases/certificate/ListCertificates');
const CreateCertificate = require('../use-cases/certificate/CreateCertificate');
const UpdateCertificate = require('../use-cases/certificate/UpdateCertificate');
const DeleteCertificate = require('../use-cases/certificate/DeleteCertificate');
const ReorderCertificates = require('../use-cases/certificate/ReorderCertificates');
// End Use-cases

const skillRepository = new MariaDBSkillRepository();
const userRepository = new MariaDBUserRepository();
const socialLinkRepository = new MariaDBSocialLinkRepository();
const refreshTokenRepository = new MariaDBRefreshTokenRepository();
const profileRepository = new MariaDBProfileRepository();
const organizationRepository = new MariaDBOrganizationRepository();
const positionRepository = new MariaDBPositionRepository();
const skillCategoryRepository = new MariaDBSkillCategoryRepository();
const projectRepository = new MariaDBProjectRepository();
const mediaRepository = new MariaDBMediaRepository();
const certificateRepository = new MariaDBCertificateRepository();
const imageProcessor = new SharpImageProcessor();
const passwordHasher = new BcryptPasswordHasher();
const tokenManager = new JwtTokenManager({
  secret: config.jwt.secret,
  audience: config.jwt.audience,
  issuer: config.jwt.issuer,
  accessTokenTtlSeconds: config.jwt.expiresInSeconds,
  refreshTokenTtlSeconds: config.auth.refreshTokenTtlSeconds,
});
const fileStorage = new MinioFileStorage(minioClient, config.minio.bucket, config.minio.publicUrl);

const getProfile = new GetProfile(profileRepository);
const listPublishedProjects = new ListPublishedProjects(projectRepository);
const getTimeline = new GetTimeline(organizationRepository);
const skillDeps = { skillRepository, skillCategoryRepository, mediaRepository };
const listPublishedSkills = new ListPublishedSkills(skillDeps);
const listPublicSocialLinks = new ListPublicSocialLinks(socialLinkRepository);
const certificateDeps = { certificateRepository, mediaRepository };
const listPublishedCertificates = new ListPublishedCertificates(certificateDeps);

module.exports = {
  // Public
  listPublishedSkills,
  listPublishedProjects,
  getPublishedProject: new GetPublishedProject(projectRepository),
  getTimeline,
  listPublicSocialLinks,
  listPublishedCertificates,
  getPortfolio: new GetPortfolio({
    getProfile,
    listPublishedSkills,
    listPublishedProjects,
    getTimeline,
    listPublicSocialLinks,
    listPublishedCertificates,
  }),
  // Health
  checkHealth: new CheckHealth({ pingDatabase: () => sequelize.authenticate() }),
  // Auth
  loginUser: new LoginUser(userRepository, refreshTokenRepository, passwordHasher, tokenManager),
  refreshAccessToken: new RefreshAccessToken(refreshTokenRepository, userRepository, tokenManager),
  logoutUser: new LogoutUser(refreshTokenRepository, tokenManager),
  getCurrentAdmin: new GetCurrentAdmin(userRepository),
  // Profile
  getProfile,
  updateProfile: new UpdateProfile(profileRepository, mediaRepository),
  // Media
  uploadMedia: new UploadMedia({ mediaRepository, fileStorage, imageProcessor, logger }),
  deleteMedia: new DeleteMedia({ mediaRepository, fileStorage, logger }),
  cleanupOrphanMedia: new CleanupOrphanMedia({ mediaRepository, fileStorage, logger }),
  // Fungsi murni untuk presenter: object key → URL publik (satu-satunya ekspor non-use-case).
  mediaUrlFor: (key) => fileStorage.getPublicUrl(key),
  // Timeline
  listOrganizations: new ListOrganizations(organizationRepository),
  createOrganization: new CreateOrganization(organizationRepository),
  updateOrganization: new UpdateOrganization(organizationRepository),
  deleteOrganization: new DeleteOrganization(organizationRepository),
  createPosition: new CreatePosition(organizationRepository, positionRepository),
  updatePosition: new UpdatePosition(organizationRepository, positionRepository),
  deletePosition: new DeletePosition(positionRepository),
  reorderPositions: new ReorderPositions(organizationRepository, positionRepository),
  // Skill categories
  listSkillCategories: new ListSkillCategories(skillCategoryRepository, skillRepository),
  createSkillCategory: new CreateSkillCategory(skillCategoryRepository),
  updateSkillCategory: new UpdateSkillCategory(skillCategoryRepository),
  deleteSkillCategory: new DeleteSkillCategory(skillCategoryRepository, skillRepository),
  reorderSkillCategories: new ReorderSkillCategories(skillCategoryRepository),
  // Projects
  listProjects: new ListProjects(projectRepository),
  getProject: new GetProject(projectRepository),
  createProject: new CreateProject(projectRepository, mediaRepository),
  updateProject: new UpdateProject(projectRepository, mediaRepository),
  deleteProject: new DeleteProject(projectRepository),
  reorderProjects: new ReorderProjects(projectRepository),
  // Skills
  listSkills: new ListSkills(skillDeps),
  getSkill: new GetSkill(skillDeps),
  createSkill: new CreateSkill(skillDeps),
  updateSkill: new UpdateSkill(skillDeps),
  deleteSkill: new DeleteSkill(skillDeps),
  reorderSkills: new ReorderSkills(skillDeps),
  // Social links
  listSocialLinks: new ListSocialLinks({ socialLinkRepository }),
  createSocialLink: new CreateSocialLink({ socialLinkRepository }),
  updateSocialLink: new UpdateSocialLink({ socialLinkRepository }),
  deleteSocialLink: new DeleteSocialLink({ socialLinkRepository }),
  reorderSocialLinks: new ReorderSocialLinks({ socialLinkRepository }),
  // Certificates
  listCertificates: new ListCertificates(certificateDeps),
  createCertificate: new CreateCertificate(certificateDeps),
  updateCertificate: new UpdateCertificate(certificateDeps),
  deleteCertificate: new DeleteCertificate(certificateDeps),
  reorderCertificates: new ReorderCertificates(certificateDeps),
};
