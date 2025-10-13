import React, { useContext } from "react";
import * as WebBrowser from "expo-web-browser";
import { Button } from "react-native-paper";
import FontAwesome5IconButton from "react-native-vector-icons/FontAwesome5";
import { OauthHandler } from "./OauthHandler";
import translator from "../../components/translations/translator";
import { GlobalContext } from "../context/Global";

WebBrowser.maybeCompleteAuthSession();
export default function AppleAuthentication({ navigation }: any) {
  const {
    authState: { locale },
    authDispatch,
  } = useContext(GlobalContext);
  const handlePress = async () => {
    await OauthHandler(navigation, "apple", authDispatch, locale);
  };
  return (
    <Button
      style={{ marginVertical: 5 }}
      textColor="white"
      icon={() => (
        <FontAwesome5IconButton
          style={{ marginRight: 3 }}
          name="apple"
          color="white"
        />
      )}
      mode="outlined"
      buttonColor="black"
      onPress={handlePress}
    >
      {translator(locale).t("continuewithapple")}
    </Button>
  );
}
