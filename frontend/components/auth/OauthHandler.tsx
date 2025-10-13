import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { UseTheStorage } from "../../components/lib/Storage";
import translator from "../../components/translations/translator";
import { BACKEND_URL } from "../lib/constants";
import {
  NavigationHelpers,
  ParamListBase,
  StackActions,
} from "@react-navigation/native";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { FormatQuery } from "../../api/graphql/FormatRequest";
import { GetProfilePicture } from "../../api/graphql/Queries";
import Container, { Toast } from "toastify-react-native";

export async function CheckAuth(
  json: {
    id: string;
    authType: string;
    birthday: string | null;
    username: string | null;
  },
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>,
  locale: string | null,
  authDispatch: any
): Promise<void> {
  // there is no birthday
  // there is birthday
  if (!authDispatch) {
    Alert.alert(
      `${translator(locale).t("error")}`,
      `${translator(locale).t("pleasetryagain")}`
    );
    return;
  }
  if (!json.id || !json.authType) {
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  }
  const checkAuth:
    | "No user"
    | "Invalid data"
    | { id: string; authType: string; birthday: string; username: string } =
    await fetch(`${BACKEND_URL}/auth/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: json.id,
        authType: json.authType,
      }),
    }).then((res) => res.json());
  if (checkAuth === "No user" || checkAuth === "Invalid data") {
    Alert.alert(
      `${translator(locale).t("error")}`,
      `${translator(locale).t("pleasetryagain")}`
    );
    navigation.navigate("Login");
    return;
  }
  const parsedJson: {
    id: string;
    authType: string;
    birthday: string;
    username: string;
    rname: string;
  } = JSON.parse(checkAuth as any);

  if (!parsedJson.birthday) {
    navigation.navigate("Birthday", {
      id: parsedJson.id,
      authType: parsedJson.authType,
      username: parsedJson.username,
      rname: parsedJson.rname,
    });
    return;
  }

  await UseTheStorage("id", parsedJson.id);
  await UseTheStorage("authType", parsedJson.authType);

  const profilePicQuery = await FormatQuery(
    GetProfilePicture(),
    {},
    `${parsedJson.id}:${parsedJson.authType}`
  );
  if (profilePicQuery && profilePicQuery.data && profilePicQuery.data.getUser) {
    authDispatch({
      type: "SET_USERAUTH",
      payload: {
        profilePicture:
          (profilePicQuery.data.getUser.profilePicture as string) || null,
        id: parsedJson.id,
        authType: parsedJson.authType,
        authUsername: parsedJson.username,
      },
    });
  } else {
    authDispatch({
      type: "SET_USERAUTH",
      payload: {
        profilePicture: null,
        id: parsedJson.id,
        authType: parsedJson.authType,
        authUsername: parsedJson.username,
      },
    });
  }
  navigation.reset({
    index: 0,
    routes: [{ name: "Home" }],
  });
  return;
}

export const OauthHandler = async (
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>,
  provider: string,
  authDispatch: any,
  locale: string | null
): Promise<void> => {
  WebBrowser.maybeCompleteAuthSession();
  WebBrowser.openAuthSessionAsync(`${BACKEND_URL}/auth/${provider}`).then(
    async (response: any) => {
      // Handle the response from the authorization server
      if (response.type === "dismiss") return;
      const authorizationCode = response.url.split("?code=")[1];
      if (authorizationCode === undefined) {
        Alert.alert(
          `${translator(locale).t("error")}`,
          `${translator(locale).t("pleasetryagain")}`
        );
        return;
      }
      const splitAuthCode = authorizationCode.split(":");
      const id = splitAuthCode[0];
      const provider = splitAuthCode[1];
      if (!id || !provider) {
        Alert.alert(
          `${translator(locale).t("error")}`,
          `${translator(locale).t("pleasetryagain")}`
        );
        return;
      }
      // check validity of authorization code

      // remove all non alphanumeric characters so a-z from provider
      const cleanedProvider = provider.replace(/[^a-z]/g, "");
      await CheckAuth(
        { id: id, authType: cleanedProvider, birthday: null, username: null },
        navigation,
        locale,
        authDispatch
      );
    }
  );
};
