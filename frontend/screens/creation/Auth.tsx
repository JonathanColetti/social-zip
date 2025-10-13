import {
  View,
  Text,
  StyleSheet,
  Linking,
  Platform,
  Alert,
  Modal,
  ImageBackground,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { shadowStyle } from "../../components/lib/Shadow";
import { GoogleAuthentication } from "../../components/auth/GoogleAuth";
import { SpotifyAuthentication } from "../../components/auth/SpotifyAuth";
import AppleAuthentication from "../../components/auth/AppleAuth";
import AcceptCookies from "../../components/modals/AcceptCookies";
import { UseTheStorage } from "../../components/lib/Storage";
import translator from "../../components/translations/translator";
import { CheckAuth } from "../../components/auth/OauthHandler";
import { BlurView } from "expo-blur";
import { BACKEND_URL } from "../../components/lib/constants";
import { GlobalContext } from "../../components/context/Global";
import { Button } from "react-native-paper";
import Modals from "../modals/Modals";

export default function Auth({ navigation, route }: any) {
  const [acceptedCookiesModal, setAcceptedCookiesModal] =
    useState<boolean>(false);
  const [demoModal, setDemoModal] = useState<boolean>(false); // [1
  const {
    authState: { id, authType, locale },
    authDispatch,
  } = useContext(GlobalContext);

  useEffect(() => {
    (async () => {
      if (route.params && route.params.id && route.params.authType) {
        await CheckAuth(
          {
            id: route.params.id,
            authType: route.params.authType,
            birthday: null,
            username: null,
          },
          navigation,
          locale,
          authDispatch
        );
        return;
      }
      const storageId = await UseTheStorage("id");
      const storageAuthType = await UseTheStorage("authType");
      if (id && authType) {
        await CheckAuth(
          {
            id: id as string,
            authType: authType as string,
            birthday: null,
            username: null,
          },
          navigation,
          locale,
          authDispatch
        );
        return;
      } else if (
        storageId &&
        storageAuthType &&
        storageId !== "" &&
        storageAuthType !== ""
      ) {
        await CheckAuth(
          {
            id: storageId,
            authType: storageAuthType,
            birthday: null,
            username: null,
          },
          navigation,
          locale,
          authDispatch
        );
        return;
      }
    })();
  }, []);
  const onPressDemo = async (text: string) => {
    await UseTheStorage("id", text);
    await UseTheStorage("authType", "google");
    authDispatch({
      type: "SET_ID_AND_AUTH_TYPE",
      payload: {
        id: text,
        authType: "google",
      },
    });
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
    return;
  };

  return (
    <ImageBackground
      source={require("../../assets/pexels-peter-spencer-1317365.jpg")}
      style={{ width: "100%", height: "100%" }}
    >
      <Modal
        animationType="slide"
        transparent={true}
        visible={acceptedCookiesModal}
      >
        <AcceptCookies setVisible={setAcceptedCookiesModal} />
      </Modal>
      <Modal animationType="slide" transparent={true} visible={demoModal}>
        <Modals
          setModalOpen={setDemoModal}
          title="Enter demo key"
          onEnter={onPressDemo}
        />
      </Modal>

      <View style={styles.authContainer}>
        <View style={{ borderRadius: 40 }}>
          <BlurView intensity={70} tint="light" style={styles.subAuthContainer}>
            <View style={styles.authHeaderContainer}>
              <Text style={styles.logoText}>social.zip</Text>
              <Text>{translator(locale).t("staySocial")}</Text>
            </View>
            <View style={styles.buttonContainers}>
              <Text style={styles.authHeaderText}>
                {translator(locale).t("loginorsignup")}
              </Text>

              <View style={styles.buttonSubContainer}>
                <GoogleAuthentication navigation={navigation} />
                <SpotifyAuthentication navigation={navigation} />
                <AppleAuthentication navigation={navigation} />
              </View>
            </View>

            <Text style={styles.disclamerText}>
              <Text
                style={{ color: "blue" }}
                onPress={() => setDemoModal(true)}
              >
                {" "}
                {"click here for demo "}
              </Text>
              {translator(locale).t("bycontinuingyouagreetosocialzips")}{" "}
              <Text
                onPress={() => Linking.openURL(`${BACKEND_URL}/terms`)}
                style={{ color: "blue" }}
              >
                {" "}
                {translator(locale).t("termsofservice")}{" "}
              </Text>{" "}
              {translator(locale).t("andconfirmthatyouhavereadsocialzips")}{" "}
              <Text
                style={{ color: "blue" }}
                onPress={() => Linking.openURL(`${BACKEND_URL}/privacy`)}
              >
                {" "}
                {translator(locale).t("privacypolicy")}{" "}
              </Text>
            </Text>
          </BlurView>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoText: {
    fontSize: Platform.OS === "web" ? 40 : 32,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    alignContent: "flex-start",
  },
  contentContainer: {},
  authContainer: {
    flex: 1,
    width: "70%",
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 40,
  },
  subAuthContainer: {
    width: "100%",
    borderRadius: 40,
    ...shadowStyle("black"),
    overflow: "hidden",
  },
  authHeaderContainer: {
    width: "100%",
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  authHeaderText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginBottom: 5,
    textAlign: "center",
  },
  buttonContainers: {
    marginTop: 10,
    alignContent: "space-between",
  },
  buttonSubContainer: {
    alignContent: "center",
    marginHorizontal: "10%",
  },
  disclamerText: {
    fontSize: 10,
    color: "black",
    textAlign: "center",
    paddingBottom: 10,
  },
});
