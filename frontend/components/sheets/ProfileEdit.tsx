import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Button,
  TextInput,
  Alert,
} from "react-native";
import React, { useContext, useRef, useState } from "react";
import ActionSheet, {
  ActionSheetRef,
  SheetManager,
} from "react-native-actions-sheet";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import * as ImagePicker from "expo-image-picker";
import Toast from "expo-react-native-toastify";
import { BlurView } from "expo-blur";
import translator from "../translations/translator";
import { FormatMutation } from "../../api/graphql/FormatRequest";
import { EditProfile } from "../../api/graphql/Mutations";
import UploadFile from "../lib/UploadFile";
import { GlobalContext } from "../context/Global";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../lib/constants";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
export interface ProfileEditProps {
  sheetId: string;
  payload: {
    accent: string;
    name: string;
    backgroundPicture: string;
    profilePicture: string;
    id: string;
    authType: string;
    setName: (value: string) => void;
    setAccent: (value: string) => void;
    setbackgroundPicture: (value: string) => void;
    setProfilePicture: (value: string) => void;
    authDispatch: (value: any) => void;
    navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  };
}

function ProfileEdit({ sheetId, payload }: ProfileEditProps) {
  const [nameModalVisible, setNameModalVisible] = useState<boolean>(false);
  const [name, setName] = useState<string>(payload.name);
  const {
    authState: { locale },
  } = useContext(GlobalContext);
  const actionSheetRef = useRef<ActionSheetRef>(null);

  const closeModal = () => {
    setNameModalVisible(false);
  };
  const handleTextChange = (text: string) => {
    setName(text);
  };
  const handleNameSave = async () => {
    if (!actionSheetRef.current) {
      Alert.alert(
        `${translator(locale).t("error")}`,
        `${translator(locale).t("pleasetryagain")}`
      );
      return;
    }
    const updateResult = await UpdateProfile(
      name,
      payload.accent,
      payload.profilePicture,
      payload.backgroundPicture,
      `${payload.id}:${payload.authType}`
    );
    if (!updateResult) {
      Toast.error(`${translator(locale).t("error")}`);
      return;
    }
    Toast.success(`${translator(locale).t("success")}`);
    payload.setName(name);
    closeModal();
    // close sheet
    actionSheetRef.current.setModalVisible(false);
  };
  const handleProfilePictureChange = async () => {
    if (!actionSheetRef.current) {
      Alert.alert(
        `${translator(locale).t("error")}`,
        `${translator(locale).t("pleasetryagain")}`
      );
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      if (result.assets[0].fileSize && result.assets[0].fileSize! > 10000000) {
        Toast.warn(`${translator(locale).t("mightLoadSlowlyWhenVisted")}`);
      }
      Toast.info(`${translator(locale).t("uploading")}`);
      const uploadedFile = await UploadFile({
        uri: result.assets[0].uri,
        length: result.assets[0].fileSize!,
      });
      if (!uploadedFile || uploadedFile == "Failed") {
        Toast.error(`${translator(locale).t("error")}`);
        return;
      }
      const updateResult = await UpdateProfile(
        payload.name,
        payload.accent,
        uploadedFile,
        payload.backgroundPicture,
        `${payload.id}:${payload.authType}`
      );
      if (!updateResult) {
        Toast.error(`${translator(locale).t("error")}`);
        return;
      }
      payload.setProfilePicture(uploadedFile);
      payload.authDispatch({
        type: "SET_PROFILE_PICTURE",
        payload: uploadedFile,
      });
      Toast.success(`${translator(locale).t("success")}`);
      actionSheetRef.current.setModalVisible(false);
      return;
    }
  };
  const handleBackgroundPictureChange = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      aspect: [4, 3],
    });
    if (!result.canceled) {
      Toast.info(`${translator(locale).t("uploading")}`);
      // check if file size is greater than 10MB and warn user that it might load slow
      if (result.assets[0].fileSize && result.assets[0].fileSize! > 10000000) {
        Toast.warn(`${translator(locale).t("mightLoadSlowlyWhenVisted")}`);
      }
      const newUri = await UploadFile({
        uri: result.assets[0].uri,
        length: result.assets[0].fileSize!,
      });
      if (!newUri || newUri == "Failed") {
        Toast.error(`${translator(locale).t("error")}`);
        return;
      }
      const updateResult = await UpdateProfile(
        payload.name,
        payload.accent,
        payload.profilePicture || "",
        newUri,
        `${payload.id}:${payload.authType}`
      );
      if (!updateResult) {
        Toast.error(`${translator(locale).t("error")}`);
        return;
      }
      payload.setbackgroundPicture(newUri);
      Toast.success(`${translator(locale).t("success")}`);
      actionSheetRef.current?.setModalVisible(false);
    }
  };
  const UpdateProfile = async (
    name: string,
    accent: string,
    profilePicture: string,
    backgroundPicture: string,
    authString: string
  ) => {
    // update profile

    const mutateResult = await FormatMutation(
      EditProfile(),
      {
        rname: name,
        accent: accent,
        profilePicture: profilePicture,
        backgroundPicture: backgroundPicture,
      },
      authString
    );
    if (
      !mutateResult ||
      !mutateResult.data ||
      mutateResult.data.editProfile === false
    ) {
      Toast.error(`${translator(locale).t("error")}`);
      return false;
    }
    Toast.success(`${translator(locale).t("success")}`);
    return true;
  };
  const handleAccentChange = async () => {
    const shouldChange: {
      payload: {
        accent: string | false;
      };
    } = await SheetManager.show("profileAccent", {
      payload: {
        accent: payload.accent,
        setValue: payload.setAccent,
      },
    });

    if (!shouldChange.payload.accent) {
      return;
    }
    Toast.info(`${translator(locale).t("uploading")}`);
    const updateResult = await UpdateProfile(
      payload.name,
      shouldChange.payload.accent,
      payload.profilePicture,
      payload.backgroundPicture,
      `${payload.id}:${payload.authType}`
    );
    if (!updateResult) {
      Toast.error(`${translator(locale).t("error")}`);
      return;
    }
    Toast.success(`${translator(locale).t("success")}`);
    actionSheetRef.current?.setModalVisible(false);
  };
  const handleNameChange = () => {
    setNameModalVisible(true);
  };
  const handleSettingsPress = () => {
    if (!actionSheetRef.current || !payload.navigation) {
      Alert.alert(
        `${translator(locale).t("error")}`,
        `${translator(locale).t("pleasetryagain")}`
      );
      return;
    }
    actionSheetRef.current?.setModalVisible(false);
    payload.navigation.reset({
      index: 0,
      routes: [{ name: "Settings" }],
    });
    return;
  };

  return (
    <ActionSheet
      id={sheetId}
      ref={actionSheetRef}
      containerStyle={{
        width: "100%",
        backgroundColor: "rgba(50, 50, 50, 0.9)",
        height: "20%",
      }}
      indicatorStyle={{
        width: 100,
        backgroundColor: "black",
      }}
      gestureEnabled={true}
      backgroundInteractionEnabled={false}
    >
      <View>
        <View style={{ justifyContent: "center" }}>
          <Modal
            transparent
            visible={nameModalVisible}
            onRequestClose={closeModal}
          >
            <BlurView style={styles.modalContainer} intensity={70} tint="dark">
              <Text style={{ fontSize: 24, paddingBottom: 10, color: "white" }}>
                {" "}
                {translator(locale).t("enterNewName")}
              </Text>
              <TextInput
                style={styles.modalTextInput}
                maxLength={20}
                onChangeText={handleTextChange}
                value={name}
                placeholder={translator(locale).t("enterNewName")}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  title={translator(locale).t("save")}
                  onPress={handleNameSave}
                />
                <Button
                  color={"red"}
                  title={translator(locale).t("cancel")}
                  onPress={closeModal}
                />
              </View>
            </BlurView>
          </Modal>
          <View style={styles.btnContainer}>
            <TouchableOpacity
              onPress={handleAccentChange}
              style={styles.boxContainer}
            >
              <FontAwesome5Icon name="palette" size={20} color="white" />
              <Text style={styles.actionText}>
                {translator(locale).t("accentColor")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleProfilePictureChange}
              style={styles.boxContainer}
            >
              <FontAwesome5Icon
                name="images"
                size={20}
                color="white"
                onPress={handleBackgroundPictureChange}
              />
              <Text style={styles.actionText}>
                {translator(locale).t("backgroundPicture")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleProfilePictureChange}
              style={styles.boxContainer}
            >
              <FontAwesome5Icon name="images" size={20} color="white" />
              <Text style={styles.actionText}>
                {translator(locale).t("profilePicture")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNameChange}
              style={styles.boxContainer}
            >
              <FontAwesome5Icon name="signature" size={20} color="white" />
              <Text style={styles.actionText}>
                {translator(locale).t("name")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSettingsPress}
              style={styles.boxContainer}
            >
              <FontAwesome5Icon name="cog" size={20} color="white" />
              <Text style={styles.actionText}>
                {translator(locale).t("settings")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ActionSheet>
  );
}
const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
    flexWrap: "wrap",
  },
  boxContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: SCREEN_HEIGHT / 12,
    width: SCREEN_WIDTH / 3,
  },
  actionText: {
    textAlign: "center",
    color: "white",
  },
  modalTextInput: {
    height: 40,
    width: "90%",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 30,
    marginBottom: 10,
    color: "white",
    textAlign: "center",
  },
  modalContainer: {
    alignItems: "center",
    top: "40%",
    width: "80%",
    padding: "7%",
    alignSelf: "center",
    borderRadius: 30,
    justifyContent: "center",
    alignContent: "center",
    overflow: "hidden",
  },
});

export default ProfileEdit;
