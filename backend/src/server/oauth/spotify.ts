import { Strategy as SpotifyStrategy } from "passport-spotify";
import { checkDb } from "./oauthDb.js";
import "dotenv/config";

export const spotifyStrat: SpotifyStrategy = new SpotifyStrategy(
  {
    clientID: process.env.SPOTIFY_CLIENT_ID!,
    clientSecret: process.env.SPOTIFY_SECRET_ID!,
    callbackURL: `${process.env.BACKEND_URL!}/auth/spotify/callback`,
    scope: ["user-read-email"],
  },
  async function (
    _accessToken: string,
    _refreshToken: string,
    expires_in: any,
    profile: any,
    done: Function
  ) {
    // Handle the user's profile data here
    // set update dynamodb userauth table
    // check if user exists
    return await checkDb("spotify", done, {
      id: profile.id,
      authType: "spotify",
      email: profile._json && profile._json.email ? profile._json.email : null,
    });
  }
);
