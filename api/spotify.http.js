const axios = require("axios").default;
const baseURL = "https://api.spotify.com/v1";
const spotifyHttp = axios.create({ baseURL });

module.exports = {
  spotifyHttp,
};
