import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { checkDb } from "./oauthDb.js";
import "dotenv/config";

export const googleStrat: GoogleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.BACKEND_URL!}/auth/google/callback`,
    debug: true,
  },
  async function (
    _accessToken: string,
    _refreshToken: string,
    _req: unknown,
    profile: any,
    done: Function
  ) {
    return await checkDb("google", done, {
      id: profile.id,
      authType: "google",
      email: profile._json && profile._json.email ? profile._json.email : null,
    });
  }
);
