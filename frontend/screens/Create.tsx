import { View, StyleSheet, Platform, ScrollView, Modal } from "react-native";
import { Button, Menu, PaperProvider } from "react-native-paper";
import React, { useContext, useEffect, useState } from "react";
import { shadowStyle } from "../components/lib/Shadow";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlobalContext } from "../components/context/Global";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";
import { checkMaxFileUpload, MAX_CHAR_SIZE } from "../components/lib/Utils";
import Modals, { AskForLinkModal } from "./modals/Modals";
import RenderTheHtml from "../components/posts/RenderTheHtml";
import Container, { Toast } from "toastify-react-native";
import translator from "../components/translations/translator";
import {
  CAROUSEL_FILTER_COLOR,
  CAROUSEL_FILTER_COLOR_ANDRIOD,
  SCREEN_HEIGHT,
} from "../components/lib/constants";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";

export interface CreateProps {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  route: any;
}

function Create({ navigation, route }: CreateProps) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [uri, setUri] = useState<string>("");
  const [textStyle, setTextStyle] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [text, setText] = useState<string | null>(null);
  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);
  const insets = useSafeAreaInsets();
  const {
    authState: { isDarkTheme, btmHeight, locale },
  } = useContext(GlobalContext);

  const darkTheme = {
    primary: "#fff",
    background: "#000",
  };
  const lightTheme = {
    primary: "#000",
    background: "#fff",
  };
  const createPost = async () => {
    navigation.navigate("FinalCreate", { uri: uri });
  };
  const addedText = (text: string) => {
    setText(text);
    setModalOpen(false);
  };
  const onAddTinyHeader = () => {
    setTextStyle("h3");
    setModalOpen(true);
  };
  const onAddHeader = () => {
    setTextStyle("h1");
    setModalOpen(true);
  };
  const onAddSubHeader = () => {
    setTextStyle("h2");
    setModalOpen(true);
  };
  const onAddText = () => {
    setTextStyle("p");
    setModalOpen(true);
  };
  const onAddYoutube = () => {
    setTextStyle("yt");
    setModalOpen(true);
  };
  const onAddLink = () => {
    setTextStyle("a");
    setModalOpen(true);
  };
  useEffect(() => {
    if (!textStyle || !text) return;
    const addedText = `<${textStyle}>${text}</${textStyle}>`;
    if (uri.length + addedText.length >= MAX_CHAR_SIZE) {
      // 10k character limit
      Toast.error(translator(locale).t("maxCharLimitReached"));
      return;
    }
    setUri(uri.concat(addedText));
    setTextStyle(null);
    setText(null);
  }, [textStyle, text]);
  const onAddImage = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.error(translator(locale).t("permissionDenied"));
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      aspect: [4, 3],
      allowsEditing: true,
    });
    if (!result.canceled) {
      if (!checkMaxFileUpload(result.assets[0].fileSize as number)) {
        Toast.error(`${translator(locale).t("fileSizeTooLarge")}`);
        return;
      }
      const addedString = `<img src='${result.assets[0].uri}' />`;
      if (uri.length + addedString.length >= MAX_CHAR_SIZE) {
        // 10k character limit
        Toast.error(translator(locale).t("maxCharLimitReached"));
        return;
      }
      setUri(uri.concat(addedString));
      return;
    }
    closeMenu();
  };
  const onAddVideo = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.error(translator(locale).t("permissionDenied"));
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: false,
      aspect: [4, 3],
      allowsEditing: true,
    });
    if (!result.canceled) {
      if (!checkMaxFileUpload(result.assets[0].fileSize as number)) {
        Toast.error(translator(locale).t("fileTooBig"));
        return;
      }
      const addedString = `<video src='${result.assets[0].uri}'></video>`;
      if (uri.length + addedString.length >= MAX_CHAR_SIZE) {
        // 10k character limit
        Toast.error(`${translator(locale).t("maxCharLimitReached")}`);
        return;
      }
      setUri(uri.concat(addedString));
    }
    closeMenu();
  };
  const theme = { colors: isDarkTheme ? darkTheme : lightTheme };

  return (
    <PaperProvider>
      <Container theme={"dark"} position="top" />
      <Modal
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
        style={{}}
        visible={modalOpen}
      >
        <Modals
          setModalOpen={setModalOpen}
          title={translator(locale).t("addText")}
          onEnter={addedText}
        />
      </Modal>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: "black",
          },
        ]}
      >
        <ScrollView
          style={{
            maxHeight: SCREEN_HEIGHT - btmHeight * 2.2,
            zIndex: 1,
          }}
          indicatorStyle={"white"}
        >
          <RenderTheHtml uri={uri} />
        </ScrollView>
        <Menu
          visible={isMenuOpen}
          onDismiss={closeMenu}
          style={{}}
          anchor={
            <View
              style={{
                flexDirection: "row",
                width: "100%",
              }}
            >
              <Button
                onPress={openMenu}
                icon={"plus"}
                buttonColor="black"
                style={{ borderColor: CAROUSEL_FILTER_COLOR, borderWidth: 1 }}
                textColor="white"
              >
                {translator(locale).t("add")}
              </Button>
              <View style={{ width: 20 }} />
              <Button
                disabled={uri === ""}
                onPress={createPost}
                icon={"check"}
                textColor="white"
                style={{
                  borderColor: CAROUSEL_FILTER_COLOR_ANDRIOD,
                  borderWidth: uri === "" ? 0 : 1,
                }}
              >
                {translator(locale).t("finish")}
              </Button>
            </View>
          }
        >
          <Menu.Item
            leadingIcon={({ size }) => (
              <FontAwesome5Icon size={size - 1} name="youtube" />
            )}
            onPress={onAddYoutube}
            title={translator(locale).t("addYoutubeLink")}
            theme={theme}
          />
          <Menu.Item
            leadingIcon={({ size }) => (
              <FontAwesome5Icon size={size} name="link" />
            )}
            onPress={onAddLink}
            title={translator(locale).t("addLink")}
          />
          <Menu.Item
            leadingIcon={({ size }) => (
              <FontAwesome5Icon size={size} name="image" />
            )}
            onPress={onAddImage}
            title={translator(locale).t("addImage")}
          />

          <Menu.Item
            leadingIcon={({ size }) => (
              <FontAwesome5Icon size={size} name="film" />
            )}
            theme={theme}
            onPress={onAddVideo}
            title={translator(locale).t("addVideo")}
          />
          <Menu.Item
            leadingIcon={"format-header-1"}
            onPress={onAddHeader}
            title={translator(locale).t("addHeader")}
          />
          <Menu.Item
            leadingIcon={"format-header-2"}
            onPress={onAddSubHeader}
            title={translator(locale).t("addSubHeader")}
          />
          <Menu.Item
            leadingIcon={"format-header-3"}
            onPress={onAddTinyHeader}
            title={translator(locale).t("addTinyHeader")}
          />
          <Menu.Item
            leadingIcon={() => <Ionicons name="text" size={24} color="black" />}
            onPress={onAddText}
            title={translator(locale).t("addText")}
          />
        </Menu>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  birthdayCard: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 10,
    width: "90%",
    borderRadius: 40,
    ...shadowStyle(),
  },
  birthdayContent: {
    marginHorizontal: 40,
    marginTop: 20,
  },
  birthdayHeader: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
  },
  birthdayText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  textInputContainer: {
    maxWidth: "100%",
    marginTop: 15,
  },
  textInput: {
    height: 40,

    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    flex: 1,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
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

export default Create;
