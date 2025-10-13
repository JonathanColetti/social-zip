import React, { useContext, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  Linking,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FontAwesome5IconButton from "react-native-vector-icons/FontAwesome5";

import translator from "../components/translations/translator";
import Container, { Toast } from "expo-react-native-toastify";
import { UseTheStorage } from "../components/lib/Storage";
import { GlobalContext } from "../components/context/Global";

import Confirmation from "./modals/Confirmation";
import { BACKEND_URL } from "../components/lib/constants";
import { FormatMutation } from "../api/graphql/FormatRequest";
import { ChangeAccountStatus } from "../api/graphql/Mutations";
import LanguageExpandable from "../components/lib/LanguageExpandable";

export default function Settings({ navigation, route }: any) {
  const [feedbackModal, setFeedbackModal] = useState<boolean>(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState<boolean>(false);
  const [updateSettings, setUpdateSettings] = useState<boolean>(false);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const goBack = () => {
    navigation.goBack();
  };
  const {
    authState: { isDarkTheme, id, authType, locale },
    authDispatch,
  } = useContext(GlobalContext);
  const setLogout = async () => {
    authDispatch({
      type: "SET_ID_AND_AUTH_TYPE",
      payload: {
        id: null,
        authType: null,
      },
    });
    await UseTheStorage("id", "");
    await UseTheStorage("authType", "");
    await fetch(`${BACKEND_URL}/logout`);
    authDispatch({ type: "SET_PROFILE_PICTURE", payload: "" });
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  };
  const getFeedback = async (didWork: boolean) => {
    if (didWork) {
      Toast.success(`${translator(locale).t("success")}`);
    }
    setFeedbackModal(false);
  };

  const changeLanguage = async (updatedLanguage: string) => {
    authDispatch({ type: "SET_LOCALE", payload: updatedLanguage });
  };

  const updateSettingsFeedback = async (didWork: boolean) => {
    if (didWork) {
      Toast.success(`${translator(locale).t("success")}`);
    }
    setUpdateSettings(false);
  };
  const changeTheme = async () => {
    authDispatch({ type: "SET_THEME", payload: !isDarkTheme });
  };
  const onPressBlockedUsers = async () => {
    navigation.navigate("BlockedUsers");
  };
  const onChangeAccountStatus = async () => {
    if (!id || !authType) {
      Toast.error(`${translator(locale).t("pleasetryagain")}`);
      return;
    }
    const didChangeStatus = await FormatMutation(
      ChangeAccountStatus(),
      {
        makePrivate: !isPrivate,
      },
      `${id}:${authType}`
    );
    if (
      !didChangeStatus ||
      !didChangeStatus.data ||
      !didChangeStatus.data.changeAccountStatus
    ) {
      Toast.error(`${translator(locale).t("pleasetryagain")}`);
      return;
    }
    Toast.success(`${translator(locale).t("success")}`);
    setIsPrivate(!isPrivate);
  };

  const onRequestData = async () => {
    Toast.info(`${translator(locale).t("requestingdata")}`);
    const res: "Invalid data" | "Success" = await fetch(
      `${BACKEND_URL}/request/data`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          authType,
        }),
      }
    ).then((res) => res.json());
    if (res !== "Success") {
      Toast.error(`${translator(locale).t("pleasetryagain")}`);
      return;
    }
    Toast.success(`${translator(locale).t("success")}`);
  };
  const onPressLanguage = async () => {};
  return (
    <>
      <View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: "black" }]}
      />
      <ScrollView>
        <Container theme={"dark"} position="top" />
        <View
          style={[
            styles.container,
            { backgroundColor: isDarkTheme ? "black" : "white" },
          ]}
        >
          <Modal
            animationType="slide"
            visible={deleteAccountModal}
            transparent={true}
          >
            <Confirmation
              authDispatch={authDispatch}
              navigation={navigation}
              setVisible={setDeleteAccountModal}
            />
          </Modal>
          {/* <Modal
            animationType="slide"
            visible={updateSettings}
            transparent={true}
          ></Modal> */}
          <SafeAreaProvider>
            <View
              style={[
                styles.header,
                {
                  marginTop: Platform.OS !== "web" ? 15 : 0,
                  borderColor: isDarkTheme ? "white" : "black",
                },
              ]}
            >
              <FontAwesome5IconButton
                style={[styles.backButton]}
                name="arrow-circle-left"
                size={24}
                onPress={goBack}
              />
              <Text
                style={[
                  styles.headerText,
                  { color: isDarkTheme ? "white" : "black" },
                ]}
              >
                {translator(locale).t("settings")}
              </Text>
            </View>
            <View style={styles.body}>
              <View style={styles.row}>
                <TouchableOpacity
                  onPress={onPressBlockedUsers}
                  style={[styles.subrow]}
                >
                  <Text
                    style={[
                      styles.bodyHeader,
                      { color: isDarkTheme ? "white" : "black" },
                    ]}
                  >
                    {translator(locale).t("blockedUsers")}
                  </Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  onPress={onChangeAccountStatus}
                  style={[styles.subrow, {}]}
                >
                  <Text
                    style={[
                      styles.bodyHeader,
                      { color: isDarkTheme ? "white" : "black" },
                    ]}
                  >
                    {isPrivate
                      ? translator(locale).t("accountIsPrivate")
                      : translator(locale).t("accountIsPublic")}
                  </Text>
                </TouchableOpacity> */}
                <LanguageExpandable />
                {/* <TouchableOpacity onPress={onRequestData} style={styles.subrow}>
                  <Text
                    style={[
                      styles.bodyHeader,
                      { color: isDarkTheme ? "white" : "black" },
                    ]}
                  >
                    {translator(locale).t("requestdata")}
                  </Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                  onPress={() => Linking.openURL("https://discord.gg/ha5vZkBb")}
                  style={styles.subrow}
                >
                  <Text
                    style={[
                      styles.bodyHeader,
                      { color: isDarkTheme ? "white" : "black" },
                    ]}
                  >
                    Discord
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={setLogout} style={styles.subrow}>
                  <Text
                    style={[
                      styles.bodyHeader,
                      { color: isDarkTheme ? "white" : "black" },
                    ]}
                  >
                    {translator(locale).t("logout")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setDeleteAccountModal(true)}
                  style={[styles.subrow]}
                >
                  <Text style={[styles.bodyHeader, { color: "red" }]}>
                    {translator(locale).t("deleteaccount")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaProvider>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 100,
  },

  header: {
    borderBottomWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    padding: 30,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  bodyHeader: {
    fontSize: 24,
    fontWeight: "500",
    margin: "4%",
    textAlign: "center",
  },
  body: {
    flex: 1,
  },
  modalStyle: {
    alignItems: "center",
    justifyContent: "center",
  },
  subrow: {
    borderBottomWidth: 0.2,
    borderTopWidth: 0.2,
  },
  row: {
    // height: '%',
    flex: 1,
    // backgroundColor: 'black',
    // marginBottom: 10,
    // padding: '6%',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  rowText: {
    color: "black",
    fontSize: 20,
    textAlign: "center",
  },
  backButton: {},
});
