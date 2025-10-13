import { dynamodb, redisClient } from "../../app.js";
import { AWSError } from "aws-sdk";
import { IUserAuth } from "../../@types/user.js";
import { INotification } from "../../@types/notification.js";
import { AddUser } from "../weaviate/index.js";
import { GetUserAuth } from "../../util.js";
import { CreateUserD } from "../dgraphql/actions/mutations.js";
import { GetProfileUid } from "../dgraphql/actions/queries.js";

/*
    Delete a user from the UserAuth table
    time complexity: O(1)
    @param username: string
*/
async function DeleteUser(id: string, authType: string): Promise<boolean> {
  try {
    // check if the user is banned
    const userObj = await GetUserAuth(id, authType);
    if (userObj === false || userObj.isBanned) return false;
    // delete from redis cache
    await redisClient.del(`${id}:${authType}`);
    // delete from dynamodb
    const didDeleteFromDynamoDb = dynamodb.delete({
      TableName: "UserAuth",
      Key: {
        id: id,
        authType: authType,
      },
    });
    if (!didDeleteFromDynamoDb) return false;
    return true;
  } catch (err) {
    return false;
  }
}
/*
    Delete a report
    time complexity: O(1)
    @param id: string
    @param authType: string
    @param postId: string
*/
async function DeleteReport(id: string, authType: string, timestamp: number) {
  try {
    const deleteReportParams: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
      TableName: "Reports",
      Key: {
        uid: `${id}:${authType}`,
        timestamp: timestamp,
      },
    };
    await dynamodb.delete(deleteReportParams).promise();
    return true;
  } catch (err) {}
  return false;
}

/*
    Report something
    time complexity: O(1)
    @param id: string
    @param authType: string
    @param postId: string
    @param commentId: string | null
    @param reason: string | null
*/
async function ReportSomething(
  id: string,
  authType: string,
  postId: string,
  commentId: string | null,
  username: string | null,
  hashtag: string | null,
  reason: string | null
) {
  try {
    const makeReportParams: AWS.DynamoDB.DocumentClient.PutItemInput = {
      TableName: "Reports",
      Item: {
        uid: `${id}:${authType}`,
        timestamp: Date.now(),
        postId: postId,
        username: username,
        hashtag: hashtag,
        commentId: commentId,
        reason: reason,
      },
    };
    await dynamodb.put(makeReportParams).promise();
    return true;
  } catch (err) {}
  return false;
}

/*  
    Verify if a user exists with id and authType
    time complexity: O(1)
    @param id: string
    @param authType: string
*/
async function VerifyAuth(id: string, authType: string) {
  const userObj: any = await GetUserAuth(id, authType);
  if (userObj !== false) return true;
  return false;
}

/*
    Create a user with username
    time complexity: O(1)
    @param username: string
    @param id: string
    @param authType: string
    @param name: string
    @param birthday: string
*/
async function CreateUser(
  username: string,
  id: string,
  authType: string,
  name: string,
  birthday: string,
  ip: string
): Promise<false | string | IUserAuth> {
  const userObj: false | IUserAuth = await GetUserAuth(id, authType);

  if (userObj === false || userObj.isBanned) return false;
  const isUserExist = await CheckIfUserExists(username);
  if (isUserExist) return "User already exists";
  try {
    await dynamodb
      .update({
        TableName: "UserAuth",
        Key: {
          id: id,
          authType: authType,
        },
        UpdateExpression: "set #u = :u, #b = :b, #iB = :iB, #ip = :ip",
        ExpressionAttributeNames: {
          "#u": "username",
          "#b": "birthday",
          "#iB": "isBanned",
          "#ip": "ip",
        },
        ExpressionAttributeValues: {
          ":u": username,
          ":b": birthday,
          ":iB": false,
          ":ip": ip,
        },
      })
      .promise();

    await CreateUserD(username, name, "", "", "black");
    await AddUser(name, username, ip);
    // add to redis cache
    await redisClient.set(
      `${id}:${authType}`,
      JSON.stringify({
        id: id,
        authType: authType,
        username: username,
      })
    );
    return userObj;
  } catch (err) {
    return false;
  }
}

/*
    Check if a user exists with username
    time complexity: O(1)
    @param username: string
*/
async function CheckIfUserExists(username: string): Promise<boolean> {
  const resultProfile: AWS.DynamoDB.DocumentClient.GetItemOutput | any =
    await dynamodb
      .query({
        TableName: "UserAuth",
        IndexName: "username-index",
        KeyConditionExpression: "#username = :username",
        ExpressionAttributeNames: {
          "#username": "username",
        },
        ExpressionAttributeValues: {
          ":username": username,
        },
      })
      .promise()
      .catch((e: AWSError) => {
        return false;
      });
  if (resultProfile && resultProfile.Item) {
    return true;
  }
  // check if user exists in dgraph
  const uid = await GetProfileUid(username);
  if (uid) return true;
  return false;
}

/*
    Get notifications for a user with username if no sort key is provided
    if sort key is provided, get notifications before that sort key
    time complexity: O(1)
    @param username: string
    @param lastSortKey: string | null = null
    @param pageSize: number = 5
*/
async function GetNotifications(
  username: string,
  lastSortKey: string | null = null,
  pageSize: number = 5
): Promise<false | INotification[]> {
  const resultProfile: AWS.DynamoDB.DocumentClient.GetItemOutput | any =
    await dynamodb
      .query(
        lastSortKey
          ? {
              TableName: "Notifications",
              KeyConditionExpression:
                "username = :username and stimestamp = :stimestamp",
              ExpressionAttributeValues: {
                ":username": { S: username },
                ":stimestamp": { S: lastSortKey },
              },
              // ScanIndexForward: false, // descending order
              ExclusiveStartKey: {
                username: username,
                stimestamp: lastSortKey,
              },
              Limit: pageSize,
            }
          : {
              TableName: "Notifications",
              IndexName: "username-index",
              KeyConditionExpression: "username = :username",
              ExpressionAttributeValues: {
                ":username": username,
              },
              // ScanIndexForward: false, // descending order

              Limit: pageSize,
            }
      )
      .promise()
      .catch((e: AWSError) => {
        return false;
      });
  if (resultProfile && resultProfile.Items && resultProfile.Items.length > 0) {
    return resultProfile.Items as INotification[];
  }
  return false;
}

export {
  DeleteUser,
  DeleteReport,
  ReportSomething,
  VerifyAuth,
  GetNotifications,
  CreateUser,
};
