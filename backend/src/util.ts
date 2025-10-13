import { AWSError } from "aws-sdk";
import { dynamodb, redisClient } from "./app.js";
import getConfig from "./config.js";
import https from "https";
import fs from "fs";
import { expressApp } from "./server/expressServer.js";
import { IContext, IUserAuth } from "./@types/user.js";

let httpsServer: https.Server;

/*
  Run the https server that encompasses the express server and the apollo server
  bigO: O(1)
  @return void
*/
async function RunHttpsServer(): Promise<void> {
  const config = getConfig();

  httpsServer = https.createServer(
    {
      cert: fs.readFileSync(config.tls.cert),
      key: fs.readFileSync(config.tls.key),
    },
    expressApp
  );
  await new Promise((resolve: any) => {
    httpsServer.listen(config.listenPort, config.listenIp, resolve);
  });
}

async function CloseHttpsServer() {
  await new Promise((resolve: any) => {
    httpsServer.close(resolve);
  });
}

// Checks if user is older than 18
// bigO: O(1)
// @param birthdate: string | number | Date
// @return boolean if older than a certain age
function IsOlderThan18(birthdate: string | number | Date): boolean {
  const currentDate = new Date();
  const birthDate = new Date(birthdate);

  // Calculate the difference in years
  let age = currentDate.getFullYear() - birthDate.getFullYear();

  // Adjust age based on the month and day
  if (
    currentDate.getMonth() < birthDate.getMonth() ||
    (currentDate.getMonth() === birthDate.getMonth() &&
      currentDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 18;
}

// check if user is authenticated if not return false
// bigO: O(1)
// @param authHeader: string
// @return false | IContext
async function CheckAuth(authHeader: string): Promise<false | IContext> {
  const values = Object.values(authHeader);
  const authContext = values.join("");
  const idAndAuthType = authContext.split(":");
  const id = idAndAuthType[0];
  const authType = idAndAuthType[1];
  if (!id || !authType) return false;
  const authObject: false | IUserAuth = await GetUserAuth(id, authType);

  if (authObject && authObject.isBanned === false) {
    return {
      id: id,
      authType: authType,
      username: authObject.username,
    };
  }
  return false;
}

/*
 * Check redis cache for user if not put
 * @param id: string the id of oauth
 * @param authType: string the type of oauth
 * @return false | IUserAuth
 */
async function GetUserAuth(
  id: string,
  authType: string
): Promise<false | IUserAuth> {
  const redisKey = `${id}:${authType}`;
  try {
    const resultProfile: false | IUserAuth = await GetUserAuthFromDynamoDb(
      id,
      authType
    );
    if (resultProfile && resultProfile.isBanned === false) {
      if (!resultProfile.birthday) {
        return resultProfile;
      }
      await redisClient.set(redisKey, JSON.stringify(resultProfile));
      return resultProfile;
    }

    return false;
  } catch (error) {
    return false;
  }
}

/*
 * Get user auth from dynamodb
 * BigO: O(1)
 * @param id: string the id of oauth
 * @param authType: string the type of oauth
 * @return false | IUserAuth
 */
async function GetUserAuthFromDynamoDb(
  id: string,
  authType: string
): Promise<false | IUserAuth> {
  const resultProfile: AWS.DynamoDB.DocumentClient.GetItemOutput | any =
    await dynamodb
      .get({
        TableName: "UserAuth",
        Key: {
          id: id,
          authType: authType,
        },
      })
      .promise()
      .catch((e: AWSError) => {
        return false;
      });
  if (resultProfile && resultProfile.Item) {
    if (resultProfile.Item.isBanned) {
      return false;
    }
    return resultProfile.Item;
  }
  return false;
}

export {
  RunHttpsServer,
  CloseHttpsServer,
  IsOlderThan18,
  CheckAuth,
  GetUserAuth,
};
