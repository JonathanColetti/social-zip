import { Dimensions } from "react-native";
import { IContentFilter } from "../../screens/Home";
import translator from "../translations/translator";

export const LARGE_BUTTON_SIZE = 40;

export const AUDIO_TRACK_HEIGHT = 50;

export const WAVEFORM_WIDTH_MARGIN = 20;

export const SCREEN_WIDTH = Dimensions.get("window").width;

export const SCREEN_HEIGHT = Dimensions.get("window").height;

export const PROFILE_PICTURE_SIZE = 150;

export const PROFILE_FROM_TOP = 25;

export const REALLY_LARGE_FONT = 30;

export const PROFILE_POST_PICTURE_SIZE = 40;

export const CAROUSEL_WIDTH = SCREEN_WIDTH * 0.4;
export const CAROUSEL_HEIGHT = SCREEN_HEIGHT * 0.132;

export const DEFAULT_FILTERS = (locale: string | null): IContentFilter[] => [
  { hashtag: translator(locale).t("following"), isPinned: true },
  { hashtag: translator(locale).t("explore"), isPinned: true },
];

export const DEFAULT_FILTERS_UNLOGGEDIN = (
  locale: string | null
): IContentFilter[] => [
  { hashtag: translator(locale).t("explore"), isPinned: true },
];

export const BACKEND_URL = "https://backend.socialzip.net";

export const CAROUSEL_FILTER_COLOR = "#006ee6";

export const CAROUSEL_FILTER_COLOR_ANDRIOD = "#a4c639";

export const MAX_USERNAME_SIZE = 24;

export const MAX_NAME_SIZE = MAX_USERNAME_SIZE * 2;

export const S3_URL = "https://d3hizkdxs4cxf8.cloudfront.net";
