import AppleStrategy from "passport-apple";
import { checkDb } from "./oauthDb.js";
import getConfig from "../../config.js";
// import jsonwebtoken
import jwt from "jsonwebtoken";
export const appleStrat = new AppleStrategy(
  {
    clientID: process.env.APPLE_CLIENT_ID!,
    teamID: process.env.APPLE_TEAM_ID!,
    callbackURL: `https://backend.socialzip.net/auth/apple/callback`,
    keyID: process.env.APPLE_KEY_ID!,
    privateKeyString: process.env.APPLE_PRIVATE_KEY!,
    // passReqToCallback: true,
  },
  async function (
    _req: any,
    _accessToken: any,
    _refreshToken: any,
    decodedIdToken: any,
    profile: any,
    done: Function
  ) {
    const decoded = jwt.decode(decodedIdToken);
    if (typeof decoded === "string" || !decoded.sub) {
      return done(false);
    }
    return checkDb("apple", done, {
      id: decoded.sub,
      authType: "apple",
      email: decoded.email,
    });
  }
);
