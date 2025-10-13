import Upload, { MultipartUploadOptions } from "react-native-background-upload";
import { checkIfLoggedIn } from "./Utils";
import { BACKEND_URL } from "./constants";
import { load } from "cheerio";
import * as FileSystem from "expo-file-system";

async function ChangeLocalUriToRemoteUriInHtml(html: string): Promise<string> {
  const $ = load(html);
  let newHtml = html;
  // do a for of loop
  const mapOfElements: { [key: string]: string } = {};
  for (const element of $("img[src], video[src]")) {
    const srcAttribute = $(element).attr("src");
    if (srcAttribute) {
      // get file from uri with FileSystem
      const file: any = await FileSystem.getInfoAsync(srcAttribute, {
        size: true,
      });
      const newFileUriSub: string | undefined = await UploadFile({
        uri: srcAttribute,
        length: file.size!,
      });

      if (newFileUriSub) {
        mapOfElements[srcAttribute] = newFileUriSub;
      }
    }
  }
  for (const [key, value] of Object.entries(mapOfElements)) {
    newHtml = newHtml.replace(key, value);
  }
  return newHtml;
}

async function UploadFile(mediaFile: {
  uri: string;
  length: number;
}): Promise<string | undefined> {
  let url = `${BACKEND_URL}/user/upload`;

  const isAuthed = await checkIfLoggedIn();
  if (!isAuthed) {
    return undefined;
  }
  const { id, authType } = isAuthed;
  const options: MultipartUploadOptions = {
    url: url,
    path: mediaFile.uri,
    field: "file",
    method: "POST",
    type: "multipart",
    parameters: {
      size: String(mediaFile.length),
    },
    headers: {
      "content-type": "application/octet-stream", // Customize content-type
      Authorization: `${id}:${authType}`,
    },
  };
  return Upload.startUpload(options).then(
    (uploadId) =>
      new Promise((resolve, reject) => {
        Upload.addListener("progress", uploadId, (data) => {});
        Upload.addListener("error", uploadId, (data) => {
          reject(data);
        });
        Upload.addListener("cancelled", uploadId, (data) => {
          reject(data); //
        });
        Upload.addListener("completed", uploadId, (data) => {
          // data includes responseCode: number and responseBody: Object
          resolve(data.responseBody.replace(/"/g, ""));
        });
      })
  );
}
export { ChangeLocalUriToRemoteUriInHtml };
export default UploadFile;
