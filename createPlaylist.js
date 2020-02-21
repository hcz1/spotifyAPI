const { spotifyApi, spotifyUserApi } = require("./api");
(async function() {
  const { id: userID } = await spotifyUserApi.then(api => api.me());
  const {
    name: playlistName,
    id: playlistID,
  } = await spotifyUserApi.then(api =>
    api.createPlaylist({ playlistName: "test", userID })
  );
  const search = await spotifyApi.then(api =>
    Promise.all([
      api.search({ query: "bad+guy+billie", type: "track" }),
      api.search({ query: "michael+jackson+bad", type: "track" }),
    ]).then(searchList =>
      searchList.map(({ tracks: { items } }) => items[0].uri)
    )
  );
  const resSnapshot = await spotifyUserApi.then(api =>
    api.addTrackToPlaylist({
      playlistID,
      trackID: search,
    })
  );
})().catch(e => {
  console.log(e);
});
