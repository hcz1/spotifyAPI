const qs = require("querystring");
const axios = require("axios").default;
const fs = require("fs");
const {
  toBase64,
  authenticateSpotifyAppPermissons,
} = require("./auth.helpers");
const ACCESS_TOKENS = require("./accessTokens.json");
const {
  SECRETS: { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI },
} = require("./keys");
const AUTH_URL = "https://accounts.spotify.com/api/token";

const config = {
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization:
      "Basic " + toBase64({ string: `${CLIENT_ID}:${CLIENT_SECRET}` }),
  },
};

async function getAuthToken() {
  return axios
    .post(AUTH_URL, qs.stringify({ grant_type: "client_credentials" }), config)
    .then(({ data }) => {
      return data;
    })
    .catch(e => console.error(e));
}

async function refreshUserAccessToken() {
  const requestBody = {
    grant_type: "refresh_token",
    refresh_token: ACCESS_TOKENS.refresh_token,
  };
  return axios
    .post(
      `https://accounts.spotify.com/api/token`,
      qs.stringify(requestBody),
      config
    )
    .then(({ data }) => {
      return data;
    })
    .catch(e => {
      console.log(e);
      console.log("user auth token error");
    });
}

async function requestUserAccessToken(code) {
  const requestBody = {
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  };
  return axios
    .post(
      `https://accounts.spotify.com/api/token`,
      qs.stringify(requestBody),
      config
    )
    .then(({ data }) => {
      console.log(data);
      return data;
    })
    .catch(e => {
      console.log(e);
      console.log("user auth token error");
    });
}

async function getUserAuthToken() {
  if (!ACCESS_TOKENS.refresh_token) {
    const code = await authenticateSpotifyAppPermissons();
    const generatedUserAccessToken = await requestUserAccessToken(code);
    fs.writeFile(
      __dirname + "/accessTokens.json",
      JSON.stringify(generatedUserAccessToken, null, 4),
      e => e
    );
    return generatedUserAccessToken;
  }
  const refreshedUserAccessToken = await refreshUserAccessToken();
  return refreshedUserAccessToken;
}

module.exports = {
  getAuthToken,
  getUserAuthToken,
};
