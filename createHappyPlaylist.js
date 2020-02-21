const { spotifyApi, spotifyUserApi } = require("./api");
const fs = require("fs");
(async function() {
  // INIT API METHODS
  const api = await spotifyUserApi;
  const trackApi = await spotifyApi;
  // GET ALL PLAYLISTS THEN MAP TO ID
  const playlistIDList = await api
    .getMyPlaylists()
    .then(playlists => playlists.items.map(({ id }) => id));
  // GET ALL TRACKS FROM PLAYLISTS
  const allPlaylistTracks = await Promise.all(
    playlistIDList.map(id =>
      api
        .getPlaylistTracks({ playlistID: id })
        .then(({ items }) =>
          items
            .map(({ track: { name, id } }) => (id ? { name, id } : undefined))
            .filter(Boolean)
        )
    )
  ).then(playlistlist => playlistlist.filter(playlist => !!playlist.length));
  // MAP LIST OF TRACKS TO ID
  const mapToIdList = allPlaylistTracks.map(playlist =>
    playlist.map(({ id }) => id)
  );
  // FLATTEN PLAYLIST ARRAY OF TRACKS
  const flatMap = array =>
    array.reduce((prev, curr) => {
      curr.forEach(id => prev.push(id));
      return prev;
    }, []);
  const reduceToFlatArray = flatMap(mapToIdList);
  // CHUNK ARRAY INTO ARRAYS OF 100 DUE TO SPOTIFY REQUEST SIZE
  const chunkby100 = array =>
    array.reduce((prev, curr, index) => {
      if (index % 100 === 0) {
        prev.push([curr]);
      } else {
        prev[prev.length - 1].push(curr);
      }
      return prev;
    }, []);
  const chunkIDs100 = chunkby100(reduceToFlatArray);

  // GET ALL TRACKS URI AND VALENCE
  const allTracksURIValence = await Promise.all(
    chunkIDs100.map(
      async chunk =>
        await trackApi
          .getAudioFeatures({ trackIds: chunk })
          .then(({ audio_features }) =>
            audio_features.map(({ uri, valence }) => ({ uri, valence }))
          )
    )
  );
  // FILTER TRACKS VALENCE TO 0.6 OR OVER
  const filteredByValenceURI = allTracksURIValence.map(chunk =>
    chunk.filter(({ valence }) => valence >= 0.6)
  );
  const flattenValenceURI = flatMap(filteredByValenceURI);
  // RE CHUNK TO MINIMISE REQUETS
  const valenceChunk = chunkby100(flattenValenceURI);

  const mapValenceFilteredToURI = valenceChunk.map(chunk =>
    chunk.map(({ uri }) => uri)
  );

  // GET USER ID FOR PLAYLIST CREATION
  const { id: userID } = await spotifyUserApi.then(api => api.me());
  // CREATE PLAYLIST
  const { name: playlistName, id: playlistID } = await api.createPlaylist({
    playlistName: "Happy",
    userID,
  });
  await Promise.all(
    mapValenceFilteredToURI.map(
      async uriArr =>
        await api.addTracksToPlaylist({
          playlistID,
          trackURIArray: uriArr,
        })
    )
  ).then(() => {
    console.log("😬");
  });
})().catch(e => {
  console.log(e);
});
