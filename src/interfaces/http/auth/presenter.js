const toAdminResponse = ({ id, username }) => ({ id, username });

const toTokenResponse = ({ accessToken, expiresIn }) => ({
  access_token: accessToken,
  expires_in: expiresIn,
});

const toLoginResponse = (result) => ({
  ...toTokenResponse(result),
  admin: toAdminResponse(result.admin),
});

module.exports = { toAdminResponse, toTokenResponse, toLoginResponse };
