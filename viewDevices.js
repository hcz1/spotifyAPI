const { spotifyUserApi } = require("./api");
(async function() {
  await spotifyUserApi.then(async api => {
    const { devices } = await api.viewDevices();
    // await api.pause();
    // await api.play({ deviceID: "abae9785e2bd256d72823a099108fdc755049547" });
    console.log(devices);
  });
})().catch(e => {
  console.log(e);
});
