const readline = require("readline");
const {
  SECRETS: { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI },
} = require("./keys");

const generateUserAuthURL = `https://accounts.spotify.com/authorize?response_type=code&redirect_uri=${REDIRECT_URI}&client_id=${CLIENT_ID}&scope=user-read-playback-state%20user-modify-playback-state`;

const toBase64 = ({ string = "" }) => Buffer.from(string).toString("base64");

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close();
      resolve(ans);
    })
  );
}

async function authenticateSpotifyAppPermissons() {
  console.log("Please Auth: " + generateUserAuthURL);
  const callback_url = await askQuestion("Please enter the callback URL:");
  return callback_url.split("code=")[1];
}

module.exports = {
  authenticateSpotifyAppPermissons,
  toBase64,
};
