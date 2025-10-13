import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { dynamodb, redisClient } from "../app.js";
import cors from "cors";
import * as dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import { googleStrat } from "./oauth/google.js";
import { spotifyStrat } from "./oauth/spotify.js";
import { v4 as uuidv4 } from "uuid";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import { VerifyAuth, ReportSomething, CreateUser } from "./dynamodb/index.js";
import multer from "multer";
import multerS3 from "multer-s3";
import { GetUserAuth, IsOlderThan18 } from "../util.js";
import { expressMiddleware } from "@apollo/server/express4";
import { server } from "./graphql/index.js";
import { S3Client } from "@aws-sdk/client-s3";
import MixpanelEvent from "./mixpanel/index.js";
import { appleStrat } from "./oauth/apple.js";

const s3Client = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const upload = multer({
  limits: {
    fileSize: 2147483648,
    files: 1,
  },
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME!,

    metadata: function (_req: unknown, file: any, cb: Function) {
      cb(null, { fieldName: file.mimetype });
    },
    key: function (_req: unknown, file: any, cb: Function) {
      cb(null, `${uuidv4()}${file.originalname}`);
      return;
    },
  }),
  // fileFilter: function (_req: unknown, file: any, cb: Function) {
  //   // make sure that is an image or a video
  //   if (
  //     file.mimetype === "image/jpeg" ||
  //     file.mimetype === "image/png" ||
  //     file.mimetype === "video/mp4" ||
  //     file.mimetype === "image/gif"
  //   ) {
  //     cb(null, true);
  //   } else {
  //     cb(null, false);
  //   }
  // },
});

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200, // Limit each IP to 200 requests per hour
});
dotenv.config();
passport.use(googleStrat);
passport.use(spotifyStrat);
passport.use(appleStrat);

export let expressApp: express.Express;

export async function createExpressApp(): Promise<void> {
  // Define Passport serializeUser and deserializeUser functions
  passport.serializeUser((user: string, done: Function) => {
    // maybe here it might be how we are storing the user in the session
    done(null, user);
  });
  passport.deserializeUser(async (id: string, done: Function) => {
    // Look up the user data in your database based on the ID
    const idandtype: string[] = id.split(":");

    if (!idandtype[0] || !idandtype[1]) {
      return done(null, null);
    }
    if (await VerifyAuth(idandtype[0], idandtype[1])) {
      return done(null, id);
    }
    return done(null, null);
  });
  expressApp = express();
  expressApp.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware<string>(server, {
      context: async ({ req }) => {
        return req.headers.authorization || "";
      },
    })
  );
  expressApp.use(
    cors({
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    })
  );
  expressApp.use(limiter);
  expressApp.use(bodyParser.json());
  expressApp.use(bodyParser.urlencoded({ extended: true }));
  expressApp.use(
    session({
      secret: process.env.SECRET_PASSPORT!,
      resave: false,
      saveUninitialized: false,
    })
  );
  expressApp.use(passport.initialize());
  expressApp.use(passport.session());

  expressApp.get("/", (req: Request, res: Response) => {
    return res.send(`OK`);
  });
  expressApp.get("/robots.txt", (req: Request, res: Response) => {
    return res.send(`
    User-agent: *
    Disallow: /terms 
    Disallow: /privacy
    Disallow: /user/upload
    `);
  });
  expressApp.get("/health", (req: Request, res: Response) => {
    return res.send(`OK ${process.env.VERSION!}`);
  });

  expressApp.get("/privacy", (req: Request, res: Response) => {
    return res.redirect(process.env.PRIVACY_URL!);
  });
  expressApp.get("/terms", (req: Request, res: Response) => {
    return res.redirect(process.env.TERMS_URL!);
  });

  expressApp.get("/logout", (req: Request, res: Response) => {
    res.clearCookie("connect.sid");
    req.logOut((resukt: any) => {});
    return res.redirect("/");
  });

  expressApp.post("/user/upload", async (req: Request, res: Response) => {
    if (!req.headers.authorization) {
      return res.json("Invalid data");
    }
    const idAndAuth = req.headers.authorization.replace("Bearer ", "");

    const idAndAuthArr = idAndAuth.split(":");
    const id = idAndAuthArr[0];
    const authType = idAndAuthArr[1];
    const authObject = await GetUserAuth(id, authType);
    if (!id || !authType || !authObject) {
      return res.json("Invalid data");
    }

    upload.single("file")(req, res, (key?: string) => {
      const filename: Express.Multer.File | any = req.file;
      if (!filename) return res.json("Failed");
      const url: string = filename.location.replace(
        "https://socialzip.s3.us-east-2.amazonaws.com/",
        "https://d3hizkdxs4cxf8.cloudfront.net/"
      );
      MixpanelEvent("uploadFile", {
        username: authObject.username,
      });
      return res.json(url);
    });
  });

  expressApp.get("/support", (req: Request, res: Response) => {
    return res.redirect(process.env.SUPPORT_URL!);
  });

  expressApp.get("/success", (req: Request | any, res: Response) => {
    const reqUser = req.user;
    // const reqUser: string = JSON.parse(
    //   Object.values(req.sessionStore.sessions)[0] as any
    // ).passport.user;
    if (!reqUser || reqUser === null || reqUser === undefined) {
      return res.redirect("/fail");
    }
    const browser: string = getMobileOperatingSystem(
      req.headers["user-agent"] as string
    );
    const appSchema = `socialzip://?code=${reqUser as string}`;
    if (browser === "iOS") {
      return res.redirect(appSchema);
    } else if (browser === "Android") {
      return res.redirect(appSchema);
    } else {
      const user = reqUser.split(":");
      return res.redirect(
        `${process.env.WEB_URL!}/Login/${user[0]}/${user[1]}`
      );
    }
  });
  expressApp.get("/health", (req: Request, res: Response) => {
    return res.send("OK");
  });

  expressApp.get("/.well-known/apple-app-site-association", (req, res) => {
    return res.send("test");
  });
  expressApp.post("/auth/check", async (req: Request, res: Response) => {
    const { id, authType } = req.body;
    if (!id || !authType) return res.json("Invalid data");
    const getUserAuth = await GetUserAuth(id, authType);
    if (!getUserAuth) return res.json("No user");
    MixpanelEvent("checkAuth", {
      uid: `${id}:${authType}`,
    });
    return res.json(JSON.stringify(getUserAuth));
  });

  expressApp.post("/user/report", async (req: Request, res: Response) => {
    const { id, authType, postId, username, hashtag, reason, commentId } =
      req.body;
    if (!id || !authType || !(await VerifyAuth(id, authType)))
      return res.json("Invalid data");
    const report = await ReportSomething(
      id,
      authType,
      postId,
      commentId,
      username,
      hashtag,
      reason
    );
    if (!report) return res.json("Failed");
    return res.json("Success");
  });

  expressApp.post("/user/finish", async (req: Request, res: Response) => {
    const { id, authType, name, username, birthday } = req.body;
    if (!id || !authType || !name || !username || !birthday)
      return res.json("Invalid data");
    if (!IsOlderThan18(birthday)) return res.json("Not old enough");
    let ip = getIP(req);
    const update = await CreateUser(
      username.toLowerCase(),
      id,
      authType,
      name,
      birthday,
      ip
    );

    if (update === "User already exists") return res.json("Username taken");
    MixpanelEvent("createdUser", {
      username: username.toLowerCase(),
    });
    return res.json("Success");
  });

  expressApp.post("/user/ban", async (req: Request, res: Response) => {
    const { username, secret } = req.body;
    if (!username || !secret) return res.json("Invalid data");
    if (secret !== process.env.SECRET_STRING!) return res.json("Invalid data");
    return res.json("Success");
  });

  expressApp.get("/applink", (req: Request, res: Response) => {
    const { ref } = req.query;
    // ref is the way people came to my app
    const browser = getMobileOperatingSystem(
      req.headers["user-agent"] as string
    );
    MixpanelEvent("applink", {
      ref: ref,
      browser: browser,
    });
    if (browser === "iOS") {
      // give link to app store
      return res.json(process.env.APP_STORE_URL!);
    } else if (browser === "Android") {
      // give link to play store
      return res.redirect("");
    } else {
      return res.redirect("");
    }
  });

  expressApp.get("/user/request/data", async (req: Request, res: Response) => {
    const { id, authType } = req.body;
    if (!id || !authType) return res.json("Invalid data");
    const userAuth = await GetUserAuth(id as string, authType as string);
    if (!userAuth) return res.json("Invalid data");
    return res.json("Success");
  });

  expressApp.post(
    "/feedback/:id/:authType",
    async (req: Request, res: Response) => {
      const { feedback } = req.body;
      const id = req.params.id;
      const authType = req.params.authType;
      if (!feedback || !id || !authType) {
        return res.json("Invalid data");
      }
      const userAuth = await GetUserAuth(id, authType);
      if (!userAuth || userAuth.isBanned) return res.json("Invalid data");
      MixpanelEvent("feedback", {
        username: userAuth.username,
        feedback: feedback,
      });
      return res.json("Success");
    }
  );
  expressApp.post(
    "/auth/apple/callback",
    passport.authenticate("apple", {
      successRedirect: "/success",
      failureRedirect: "/fail",
    })
  );
  expressApp.get(
    "/auth/apple",
    passport.authenticate("apple", {
      successRedirect: "/success",
      failureRedirect: "/fail",
    })
  );

  expressApp.get("/apple/update", async (req: Request, res: Response) => {
    return res.json("Success");
  });

  expressApp.get("/auth/spotify", passport.authenticate("spotify", {}));

  expressApp.get(
    "/auth/spotify/callback",
    passport.authenticate("spotify", {
      failureRedirect: "/fail",
      successRedirect: "/success",
    })
  );

  expressApp.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  expressApp.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/fail",
      successRedirect: "/success",
    })
  );

  expressApp.get("/fail", (req: Request, res: Response) => {
    return res.send(
      "<center><h1>Something went wrong</h1><h3>Please try again</h3></center>"
    );
  });

  /**
   * Error handler.
   */
  expressApp.use(
    (error: unknown, req: Request, res: Response, next: Function) => {
      if (error) {
        return res.json(error);
      } else {
        next();
      }
    }
  );
  //The 404 Route (ALWAYS Keep this as the last route)
  expressApp.get("*", function (req: Request, res: Response) {
    return res.redirect("/fail");
  });
}

function getMobileOperatingSystem(
  userAgent: string
): "Windows Phone" | "Android" | "iOS" | "unknown" {
  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return "Windows Phone";
  }
  if (/android/i.test(userAgent)) {
    return "Android";
  }
  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return "iOS";
  }
  return "unknown";
}

function getIP(req) {
  // req.connection is deprecated
  const conRemoteAddress = req.connection?.remoteAddress;
  // req.socket is said to replace req.connection
  const sockRemoteAddress = req.socket?.remoteAddress;
  // some platforms use x-real-ip
  const xRealIP = req.headers["x-real-ip"];
  // most proxies use x-forwarded-for
  const xForwardedForIP = (() => {
    const xForwardedFor = req.headers["x-forwarded-for"];
    if (xForwardedFor) {
      // The x-forwarded-for header can contain a comma-separated list of
      // IP's. Further, some are comma separated with spaces, so whitespace is trimmed.
      const ips = xForwardedFor.split(",").map((ip) => ip.trim());
      return ips[0];
    }
  })();
  // prefer x-forwarded-for and fallback to the others
  return xForwardedForIP || xRealIP || sockRemoteAddress || conRemoteAddress;
}
