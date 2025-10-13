import { ISmallNotification } from "../../@types/notification.js";
import { dynamodb } from "../../app.js";

async function CreateNotification(
  username: string,
  message: string,
  postId: string | null,
  commentId: string | null
): Promise<boolean> {
  // timestamp is unix time
  const notification: ISmallNotification = {
    username,
    message,
    postId,
    commentId,
    stimestamp: String(Date.now()),
  };
  try {
    await dynamodb
      .put({
        TableName: "Notifications",
        Item: notification,
      })
      .promise();

    return true;
  } catch (err) {
    return false;
  }
}

export default CreateNotification;
