const { spotifyHttp } = require("./spotify.http");
const { spotifyUserFactory, spotifyFactory } = require("./spotify.api");

module.exports = {
  spotifyUserApi: spotifyUserFactory({ http: spotifyHttp }),
  spotifyApi: spotifyFactory({ http: spotifyHttp }),
};
