import { Button } from "react-native-paper";
import FontAwesome5IconButton from "react-native-vector-icons/FontAwesome5";
import * as WebBrowser from "expo-web-browser";
import { OauthHandler } from "./OauthHandler";
import translator from "../../components/translations/translator";
import { useContext } from "react";
import { GlobalContext } from "../context/Global";

WebBrowser.maybeCompleteAuthSession();
export function GoogleAuthentication({ navigation }: any) {
  const {
    authState: { locale },
    authDispatch,
  } = useContext(GlobalContext);
  const handlePress = async () => {
    await OauthHandler(navigation, "google", authDispatch, locale);
  };

  return (
    <Button
      style={{ marginVertical: 5 }}
      textColor="black"
      icon={() => <FontAwesome5IconButton name="google" />}
      mode="outlined"
      buttonColor="white"
      onPress={handlePress}
    >
      {translator(locale).t("continuewithgoogle")}
    </Button>
  );
}
