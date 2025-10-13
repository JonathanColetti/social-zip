import { AWSError } from "aws-sdk";
import { dynamodb } from "../../app.js";
import "dotenv/config";
import { IUserOauth } from "../../@types/user.js";
import { generateUsername } from "unique-username-generator";

async function updateDb(
  id: string | undefined,
  authType: string | undefined,
  email: string
): Promise<boolean> {
  if (!id || !authType) {
    //
    return false;
  }
  const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
    TableName: "UserAuth",
    Item: {
      id: id,
      authType: authType,
      email: email,
      username: generateUsername(undefined, undefined, 24),
      birthday: null,
      ip: null,
      isBanned: false,
    },
  };
  await dynamodb
    .put(params)
    .promise()
    .catch((err: AWSError) => {
      return null;
    });
  return true;
}

async function checkDb(
  provider: "google" | "spotify" | "apple",
  done: any,
  profile: IUserOauth
): Promise<Function> {
  const finduserauthparams: AWS.DynamoDB.DocumentClient.GetItemInput = {
    TableName: "UserAuth",
    Key: {
      id: profile.id,
      authType: provider,
    },
  };
  const findresult: AWS.DynamoDB.DocumentClient.GetItemOutput = await dynamodb
    .get(finduserauthparams)
    .promise()
    .catch((err: AWSError) => {
      return done(false);
    });
  if (findresult && findresult.Item) {
    return done(null, `${profile.id}:${provider}`);
  }
  const update = await updateDb(
    profile.id,
    provider,
    profile.email ? profile.email : null
  );
  if (!update) {
    return done(false);
  }
  // ok now store access token
  return done(null, `${profile.id}:${provider}`);
}

export { checkDb, updateDb };
