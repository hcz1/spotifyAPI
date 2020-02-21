const { spotifyApi, spotifyUserApi } = require("./api");
(async function() {
  const search = await spotifyApi.then(api =>
    Promise.all([
      api.search({ query: "bad+guy+billie", type: "track" }),
      api.search({ query: "michael+jackson+bad", type: "track" }),
    ])
  );
  console.log(search[0].tracks);
})().catch(e => {
  console.log(e);
});
