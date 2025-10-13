import { Button } from "react-native-paper";
import FontAwesome5IconButton from "react-native-vector-icons/FontAwesome5";
import * as WebBrowser from "expo-web-browser";
import { OauthHandler } from "./OauthHandler";
import translator from "../../components/translations/translator";
import { useContext } from "react";
import { GlobalContext } from "../context/Global";

WebBrowser.maybeCompleteAuthSession();

export function SpotifyAuthentication({ navigation }: any) {
  const {
    authState: { locale },
    authDispatch,
  } = useContext(GlobalContext);
  const handlePress = async () => {
    await OauthHandler(navigation, "spotify", authDispatch, locale);
  };
  return (
    <Button
      style={{ marginVertical: 5 }}
      icon={() => <FontAwesome5IconButton color="white" name="spotify" />}
      buttonColor="green"
      textColor="white"
      mode="contained"
      onPress={handlePress}
    >
      {translator(locale).t("continuewithspotify")}
    </Button>
  );
}
