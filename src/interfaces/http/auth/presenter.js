const toLoginResponse = ({ accessToken, expiresIn }) => ({
  access_token: accessToken,
  expires_in: expiresIn,
});

module.exports = { toLoginResponse };
