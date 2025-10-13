import {
  View,
  Text,
  StyleSheet,
  Platform,
  Alert,
  ImageBackground,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "react-native-paper";
import { shadowStyle } from "../../components/lib/Shadow";
import { TextInput } from "react-native-gesture-handler";
import translator from "../../components/translations/translator";
import { BlurView } from "expo-blur";
import { UseTheStorage } from "../../components/lib/Storage";
import Container, { Toast } from "toastify-react-native";
import {
  BACKEND_URL,
  MAX_NAME_SIZE,
  MAX_USERNAME_SIZE,
} from "../../components/lib/constants";
import { GlobalContext } from "../../components/context/Global";
import {
  NavigationHelpers,
  ParamListBase,
  StackActions,
} from "@react-navigation/native";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";

function Name({
  navigation,
  route,
}: {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  route: any;
}) {
  const [name, setName] = useState<string>(route.params.rname);
  const [username, setUsername] = useState<string>(route.params.username);
  const [isTaken, setIsTaken] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const {
    authState: { locale },
    authDispatch,
  } = useContext(GlobalContext);
  useEffect(() => {
    if (
      !route ||
      !route.params ||
      !route.params.id ||
      !route.params.authType ||
      !route.params.birthday
    ) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
    setUsername(route.params.username);
  }, []);

  const uploadContent = async () => {
    setIsUploading(true);
    const id = route.params.id;
    const authType = route.params.authType;
    const birthday = route.params.birthday;
    Toast.info(`${translator(locale).t("creatingaccount")}`);
    if (!id || !authType || !birthday || !name || !username) {
      Toast.error(`${translator(locale).t("pleasetryagain")}`);
      return;
    }

    const isFinished = await fetch(`${BACKEND_URL}/user/finish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        authType: authType,
        name: name,
        username: username,
        birthday: birthday,
      }),
    }).then((response) => response.json());
    if (isFinished === "Success") {
      await UseTheStorage("id", id);
      await UseTheStorage("authType", authType);
      authDispatch({
        type: "SET_ID_AND_AUTH_TYPE",
        payload: {
          id: id,
          authType: authType,
        },
      });
      Toast.success(`${translator(locale).t("success")}`);
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } else if (isFinished === "Invalid data") {
      Toast.error(`${translator(locale).t("pleasetryagain")}`);
    } else if (isFinished === "Username taken") {
      setIsTaken(true);
      Toast.error(`${translator(locale).t("usernameisnotavailable")}`);
    } else {
      Toast.error(`${translator(locale).t("pleasetryagain")}`);
    }
    setIsUploading(false);
  };
  const onChangeText = (text: string) => {
    setName(text);
  };
  const onChangeUsernameText = (text: string) => {
    // regex to check if special character or capital
    const regex = new RegExp("^[a-z0-9]+$");
    // check if text is a space
    if (text.length === 0) {
      setUsername(text);
      return;
    }
    if (!regex.test(text) || text.includes(" ")) {
      return;
    }

    setUsername(text);
  };
  return (
    <ImageBackground
      source={require("../../assets/pexels-monstera-7412093.jpg")}
      style={styles.container}
    >
      <Container theme={"dark"} position="top" />
      <BlurView intensity={100} style={StyleSheet.absoluteFill} />
      <View style={styles.prefCard}>
        <View style={styles.prefContent}>
          <View style={styles.perfHeader}>
            <Text style={styles.perfText}>{translator(locale).t("name")}</Text>
          </View>
          <TextInput
            style={styles.textInputStyle}
            placeholder={translator(locale).t("whatisyourname")}
            onChangeText={onChangeText}
            autoCapitalize="none"
            maxLength={MAX_NAME_SIZE}
          />
          <TextInput
            style={[
              styles.textInputStyle,
              isTaken ? { borderColor: "red" } : { borderColor: "black" },
            ]}
            placeholder={translator(locale).t("whatisyourusername")}
            value={username}
            onChangeText={onChangeUsernameText}
            autoCapitalize="none"
            maxLength={MAX_USERNAME_SIZE}
          />
          <Text
            style={{ alignSelf: "center", color: isTaken ? "red" : "black" }}
          >
            {isTaken
              ? translator(locale).t("usernameisnotavailable")
              : translator(locale).t("usernameisnotchangeable")}
          </Text>
          <Button
            buttonColor="black"
            style={{ marginTop: 20 }}
            mode="contained"
            onPress={uploadContent}
            disabled={isUploading}
          >
            {translator(locale).t("createaccount")}
          </Button>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  prefCard: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 40,
    paddingBottom: 10,
    ...shadowStyle(),
  },
  prefContent: {
    marginHorizontal: 40,
    marginTop: 20,
  },
  perfHeader: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
  },
  perfText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  textInputStyle: {
    height: 40,
    borderColor: "black",
    borderWidth: 1,
    marginTop: 15,
    textAlign: "center",
    borderRadius: 20,
  },
  logoText: {
    position: "absolute",
    fontSize: Platform.OS === "web" ? 40 : 32,
    fontWeight: "bold",
    color: "black",
    top: 20,
    left: 20,
  },
});

export default Name;
