const { getAuthToken, getUserAuthToken } = require("./auth/auth");

function spotifyFactory({ http }) {
  // const { access_token } = await getAuthToken();
  return getAuthToken().then(({ access_token }) => ({
    getTrack: ({ id }) =>
      http
        .get(`/tracks/${id}`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then(({ data }) => data),
    search: ({ query = "", type = "album" }) =>
      http
        .get(`/search?q=${query}&type=${type}`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then(({ data }) => data),
    getAlbums: ({ albumIds = [] }) =>
      http
        .get(`/albums?${albumIds.join()}`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then(({ data }) => data),
    getAudioFeatures: ({ trackIds }) =>
      http
        .get(`/audio-features/?ids=${trackIds.join()}`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then(({ data }) => data),
  }));
}

async function spotifyUserFactory({ http }) {
  const {
    access_token,
    token_type,
    expires_in,
    refresh_token,
    scope,
  } = await getUserAuthToken();
  return {
    me: async () =>
      await http
        .get(`/me`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then(({ data }) => data),
    getMyPlaylists: async () =>
      await http
        .get(`/me/playlists`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then(({ data }) => data),
    createPlaylist: async ({ userID, playlistName }) =>
      await http
        .post(
          `/users/${userID}/playlists`,
          { name: playlistName },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then(({ data }) => data),
    addTrackToPlaylist: async ({ playlistID, trackID = [] }) =>
      await http
        .post(
          `/playlists/${playlistID}/tracks?uris=${trackID.join()}`,
          {},
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
        .then(({ data }) => data),
    addTracksToPlaylist: async ({ playlistID, trackURIArray = [] }) =>
      await http
        .post(
          `/playlists/${playlistID}/tracks`,
          { uris: trackURIArray },
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
        .then(({ data }) => data),
    getPlaylistTracks: async ({ playlistID }) =>
      await http
        .get(`/playlists/${playlistID}/tracks`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then(({ data }) => data),
    viewDevices: async () =>
      await http
        .get("/me/player/devices", {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        .then(({ data }) => data),
    pause: async () =>
      await http
        .put(
          `/me/player/pause`,
          {},
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
        .then(({ data }) => data),
    play: async ({ deviceID }) =>
      await http
        .put(
          `/me/player/play?device_id=${deviceID}`,
          {},
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        )
        .then(({ data }) => data),
  };
}

module.exports = {
  spotifyFactory,
  spotifyUserFactory,
};
