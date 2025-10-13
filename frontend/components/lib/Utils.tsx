import { UseTheStorage } from "./Storage";
import { HTMLContentModel, HTMLElementModel } from "react-native-render-html";
import { BACKEND_URL } from "./constants";
import translator from "../translations/translator";

export function getColor(
  bars: any,
  bar: any,
  percentPlayed: any,
  percentPlayable: any,
  inverse: any,
  ACTIVE: any,
  ACTIVE_INVERSE: any,
  ACTIVE_PLAYABLE: any,
  ACTIVE_PLAYABLE_INVERSE: any,
  INACTIVE: any,
  INACTIVE_INVERSE: any
) {
  if (bar / bars.length < percentPlayed) {
    return inverse ? ACTIVE_INVERSE : ACTIVE;
  }
  if (bar / bars.length < percentPlayable) {
    return inverse ? ACTIVE_PLAYABLE_INVERSE : ACTIVE_PLAYABLE;
  }
  return inverse ? INACTIVE_INVERSE : INACTIVE;
}

export const adjust = (color: string, amount: number) => {
  return (
    "#" +
    color
      .replace(/^#/, "")
      .replace(/../g, (color) =>
        (
          "0" +
          Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)
        ).substr(-2)
      )
  );
};

export const calculatePlaybackPercentage = (
  msPlayed: number,
  totalMs: number
) => {
  if (totalMs === 0) {
    return 0; // Avoid division by zero error
  }

  const percentage = msPlayed / totalMs;
  return Math.min(Math.max(0, percentage), 1); // Clamp the value between 0 and 1
};

export const msToMinSec = (ms: number) => {
  let minutes = Math.floor(ms / 60000);
  let seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export const formatPlaybackTime = (time: number) => {
  const minutes = Math.floor(time / 60000);
  const seconds = ((time % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, "0")}`;
};

export const UnixTimeStampToShortForm = (
  unixTimeStamp: string,
  locale: string | null
): string => {
  // unix time stamp to locale time

  const localeDate = new Date(Number(unixTimeStamp)).toLocaleString();
  // get hours from now do the locale time
  let hours = (new Date().getTime() - Number(unixTimeStamp)) / 3600000;
  // get mins
  hours = Math.floor(hours);
  const minutes = Math.floor(hours * 60);

  // Determine whether it's AM or PM

  if (hours <= 1) {
    if (minutes <= 1) {
      return translator(locale).t("justNow");
    }
    return `${minutes}m`;
  }
  if (hours < 24) {
    return `${hours} h`;
  }
  if (hours >= 24 && hours < 36) {
    return translator(locale).t("yesterday");
  }
  if (hours >= 36 && hours <= 168) {
    return `${Math.floor(hours / 24)} ${translator(locale).t("daysAgo")}`;
  }
  // check if less than a month
  if (hours > 168 && hours < 720) {
    return `${Math.floor(hours / 168)} ${translator(locale).t("weeksAgo")}`;
  }
  return localeDate;
};

export const UnixTimeStampToMonthYear = (unixTimeStamp: string) => {
  const date = new Date(Number(unixTimeStamp) * 1000); // Convert Unix timestamp to milliseconds
  const month = date.toLocaleString("default", { month: "long" }); // Get the full month name
  const year = date.getFullYear(); // Get the year
  return `${month} ${year}`;
};

/*
 * This function takes in a number and returns a short form of it
 * For example 1000 turns to 1k, 1200 turns to 1.2k, 1000000 turns to 1m, 1200000 turns to 1.2m, etc
 *  @param {number} num
 */
export const NumberToShortForm = (num: number): string => {
  if (num >= 1000000) {
    return Math.round(num / 100000) / 10 + "m";
  }
  if (num >= 1000) {
    return Math.round(num / 100) / 10 + "k";
  }
  return num.toString();
};

export const checkIfLoggedIn = async (): Promise<
  { id: string; authType: string } | false
> => {
  const id = await UseTheStorage("id");
  const authType = await UseTheStorage("authType");
  if (!id || !authType || id === "" || authType === "") {
    return false;
  }

  return { id, authType };
};

export const MAX_CHAR_SIZE = 10000;

export const checkMaxFileUpload = (size: number): boolean => {
  // check if the file is less than 2GB,  2,147,483,648 bytes
  size < 2147483648;
  return size < 2147483648;
};

export const customHTMLElementModels = {
  video: HTMLElementModel.fromCustomModel({
    tagName: "video",
    mixedUAStyles: {
      alignSelf: "center",
    },
    contentModel: HTMLContentModel.block,
  }),
  yt: HTMLElementModel.fromCustomModel({
    tagName: "yt",
    mixedUAStyles: {
      width: "100%",
      height: "100%",
      alignSelf: "center",
    },
    contentModel: HTMLContentModel.block,
  }),
};

export async function ReportSomething(
  reason: any,
  postId: string | null,
  username: string | null,
  commentId: string | null,
  hashtag: string | null,
  id: string,
  authType: string
): Promise<boolean> {
  const fetchResult = await fetch(`${BACKEND_URL}/user/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      authType,
      username,
      reason,
      postId,
      hashtag,
      commentId,
    }),
  }).then((res) => res.json());
  if (fetchResult == "Success") {
    return true;
  }
  return false;
}
