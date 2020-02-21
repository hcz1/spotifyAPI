const { spotifyApi, spotifyUserApi } = require("./api");
const fs = require("fs");
module.exports = {
  createAudioFeaturePlaylist: async function({
    audioFeatureRating = 0.6,
    nameOfPlaylist = "Happy",
    audioFeature = "valence",
  }) {
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

    // GET ALL TRACKS URI AND Features
    const allTracksURIAudioFeatures = await Promise.all(
      chunkIDs100.map(
        async chunk =>
          await trackApi
            .getAudioFeatures({ trackIds: chunk })
            .then(({ audio_features }) =>
              audio_features.map(
                ({ uri, [audioFeature]: audioFeatureProp }) => ({
                  uri,
                  audioFeatureProp,
                })
              )
            )
      )
    );
    // FILTER TRACKS AUDIO RATING
    const filteredByAudioFeatureURI = allTracksURIAudioFeatures.map(chunk =>
      chunk.filter(
        ({ audioFeatureProp }) => audioFeatureProp >= audioFeatureRating
      )
    );
    const flattenAudioRatingURI = flatMap(filteredByAudioFeatureURI);

    const mapToUri = flattenAudioRatingURI.map(({ uri }) => uri);
    const filterDupUris = mapToUri.reduce((prev, curr) => {
      if (!prev.includes(curr)) prev.push(curr);
      return prev;
    }, []);

    // RE CHUNK TO MINIMISE REQUETS
    const uriChunk = chunkby100(filterDupUris);

    // GET USER ID FOR PLAYLIST CREATION
    const { id: userID } = await spotifyUserApi.then(api => api.me());
    // CREATE PLAYLIST
    const { name: playlistName, id: playlistID } = await api.createPlaylist({
      playlistName: nameOfPlaylist,
      userID,
    });
    await Promise.all(
      uriChunk.map(
        async uriArr =>
          await api.addTracksToPlaylist({
            playlistID,
            trackURIArray: uriArr,
          })
      )
    ).then(() => {
      console.log("😬 create featured");
    });
  },
};
