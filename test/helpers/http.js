// Helper tes lapisan HTTP. Container selalu di-mock: tes route membuktikan validasi, auth,
// kode status, dan bentuk respons — bukan logika use-case.
const Jwt = require('@hapi/jwt');

const USE_CASES = [
  'checkHealth',
  'loginUser',
  'refreshAccessToken',
  'logoutUser',
  'getCurrentAdmin',
  'getProfile',
  'updateProfile',
  'listOrganizations',
  'createOrganization',
  'updateOrganization',
  'deleteOrganization',
  'createPosition',
  'updatePosition',
  'deletePosition',
  'reorderPositions',
  'listSkills',
  'getSkill',
  'createSkill',
  'updateSkill',
  'deleteSkill',
  'uploadSkillLogo',
  'listSocialMedia',
  'getSocialMediaByPlatform',
  'updateSocialMedia',
];

// Dipakai di dalam factory jest.mock('.../infrastructure/container', ...).
const createContainerMock = () =>
  Object.fromEntries(USE_CASES.map((name) => [name, { execute: jest.fn() }]));

const createAccessToken = () => {
  const config = require('../../src/config');
  return Jwt.token.generate(
    { aud: config.jwt.audience, iss: config.jwt.issuer, sub: '1', username: 'admin' },
    { key: config.jwt.secret, algorithm: 'HS256' },
    { ttlSec: 60 }
  );
};

const authHeader = () => ({ authorization: `Bearer ${createAccessToken()}` });

module.exports = { createContainerMock, createAccessToken, authHeader };
