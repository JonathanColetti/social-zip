import { View, Text, StyleSheet, Dimensions } from "react-native";
import React, { useContext, useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import { Button, IconButton } from "react-native-paper";
import translator from "../../components/translations/translator";
import { UseTheStorage } from "../../components/lib/Storage";
import { shadowStyle } from "../../components/lib/Shadow";
import { BACKEND_URL } from "../../components/lib/constants";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import Container, { Toast } from "toastify-react-native";
import { FormatMutation } from "../../api/graphql/FormatRequest";
import { DeletePost, DeleteUser } from "../../api/graphql/Mutations";
import { GlobalContext } from "../../components/context/Global";
const SCREEN_WIDTH: number = Dimensions.get("window").width;
const SCREEN_HEIGHT: number = Dimensions.get("window").height;

export default function Confirmation({
  setVisible,
  navigation,
  authDispatch,
}: {
  setVisible: any;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  authDispatch: any;
}): JSX.Element {
  // const [rating, setRating] = useState<number>(0);
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const {
    authState: { locale },
  } = useContext(GlobalContext);
  const deleteAccount = async (): Promise<void> => {
    const id = await UseTheStorage("id");
    const auth_type = await UseTheStorage("authType");
    if (!id || !auth_type) {
      Toast.error(`${translator(locale).t("pleasetryagain")}`);
      navigation.navigate("Home");
      return;
    }
    const deleteAccountMutation = await FormatMutation(
      DeleteUser,
      {},
      `${id}:${auth_type}`
    );
    if (
      !deleteAccountMutation ||
      !deleteAccountMutation.data ||
      !deleteAccountMutation.data.deleteUser
    ) {
      Toast.error(`${translator(locale).t("pleasetryagain")}`);
      return;
    }
    await UseTheStorage("id", "");
    await UseTheStorage("authType", "");

    Toast.success(`${translator(locale).t("success")}`);
    authDispatch({
      type: "SET_ID_AND_AUTH_TYPE",
      payload: {
        id: null,
        authType: null,
      },
    });
    navigation.reset({ key: "Home", index: 0, routes: [{ name: "Home" }] });
  };
  return (
    <View style={styles.container}>
      <Container theme={"dark"} position="top" />
      <View style={styles.headerStyle}>
        <IconButton
          style={styles.closeButton}
          icon="close"
          size={30}
          onPress={() => setVisible(false)}
        />
        <Text style={styles.headerText}>
          {translator(locale).t("deleteaccount")}
        </Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.subHeaderText}>
          {translator(locale).t("thiscannotbeundone")}
        </Text>
        <TextInput
          style={styles.textInputStyle}
          value={feedbackText}
          onChangeText={(text) => setFeedbackText(text)}
          placeholder={`${translator(locale).t("why")} </3 ? (${translator(
            locale
          ).t("optional")}`}
        />
        <View style={styles.buttonView}>
          <Button
            onPress={deleteAccount}
            buttonColor="red"
            style={styles.submitButtonStyle}
            mode="contained"
          >
            {translator(locale).t("delete")}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: SCREEN_WIDTH / 36,
    marginTop: SCREEN_HEIGHT / 3,
    ...shadowStyle(),
  },
  contentContainer: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    marginHorizontal: "10%",
  },
  starContainerStyle: {
    marginTop: 10,
  },
  closeButton: {
    justifyContent: "flex-start",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    justifyContent: "center",
    textAlignVertical: "center",
  },
  subHeaderText: {
    paddingTop: 10,
    fontSize: 10,
    color: "red",
    fontWeight: "500",
  },
  headerStyle: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  textInputStyle: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  submitButtonStyle: {
    marginTop: 10,
  },
  buttonView: {
    paddingBottom: 10,
  },
});
