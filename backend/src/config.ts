function getConfig() {
  // const key = fs.readFileSync("./certs/privkey.pem");
  return {
    listenIp: "0.0.0.0",
    // NOTE: Don't change listenPort (client app assumes 4443).
    listenPort: 443,
    apple_key: process.env.APPLE_PRIVATE_KEY!,
    tls: {
      cert: "./certs/fullchain.pem",
      key: "./certs/privkey.pem",
    },
  };
}

export default getConfig;
