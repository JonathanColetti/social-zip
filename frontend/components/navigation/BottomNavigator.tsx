import { useContext, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Image from "../lib/Image";
import { BlurView } from "expo-blur";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";

import {
  BottomTabNavigationEventMap,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import Home from "../../screens/Home";
import Search from "../../screens/Search";
import Create from "../../screens/Create";
import Profile from "../../screens/Profile";
import { LARGE_BUTTON_SIZE } from "../lib/constants";
import Auth from "../../screens/creation/Auth";
import Name from "../../screens/creation/Name";
import { GlobalContext } from "../context/Global";
import Birthday from "../../screens/creation/Birthday";
import Settings from "../../screens/Settings";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import ViewPost from "../../screens/ViewPost";
import FinalCreate from "../../screens/FinalCreate";
import NotificationScreen from "../../screens/Notifications";
import {
  NavigationHelpers,
  ParamListBase,
  StackActions,
} from "@react-navigation/native";
import { UseTheStorage } from "../lib/Storage";
import { FormatQuery } from "../../api/graphql/FormatRequest";
import { GetProfilePicture } from "../../api/graphql/Queries";
import BlockedUsers from "../../screens/BlockedUsers";
import Searched from "../../screens/Searched";
// import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

// const Tab = createMaterialTopTabNavigator();
const Tab = createBottomTabNavigator();

function BottomNavigator({
  navigation,
  id,
  authType,
  profilePicture,
  setBtmHeight,
  insets,
}: {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  id: string | null;
  authType: string | null;
  profilePicture: string | null;
  setBtmHeight: (height: number) => void;
  insets: EdgeInsets;
}) {
  const showBtm = true;
  const navigateHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  };
  const compareIdAndAuthType = (
    id: string | null,
    authType: string | null
  ): boolean => {
    if (id === null || authType === null || id === "" || authType === "") {
      return false;
    }
    return true;
  };
  const navigateSearch = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Search" }],
    });
  };
  const navgiateCreate = async () => {
    if (compareIdAndAuthType(id, authType) === false) {
      navigation.navigate("Login");
      return;
    }
    navigation.navigate("Create");
  };
  const navigateProfile = async () => {
    if (compareIdAndAuthType(id, authType) === false) {
      navigation.navigate("Login");
      return;
    }
    navigation.reset({
      index: 0,
      routes: [{ name: "Profile" }],
    });
  };
  const navigateNotifications = async () => {
    if (compareIdAndAuthType(id, authType) === false) {
      navigation.navigate("Login");
      return;
    }
    navigation.navigate("Notifications");
  };

  const onLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setBtmHeight(height);
  };
  return (
    <>
      {showBtm && (
        <BlurView
          onLayout={onLayout}
          tint={"dark"}
          intensity={30}
          style={[styles.container, { paddingBottom: insets.bottom }]}
        >
          <View style={styles.buttonContainer}>
            <FontAwesomeIcon
              onPress={navigateHome}
              color={"white"}
              name="home"
              size={LARGE_BUTTON_SIZE - 5}
            />
            <FontAwesomeIcon
              onPress={navigateSearch}
              color={"white"}
              name="search"
              size={LARGE_BUTTON_SIZE - 5}
            />
            <TouchableOpacity onPress={navgiateCreate} style={styles.circle} />
            <FontAwesomeIcon
              onPress={navigateNotifications}
              color={"white"}
              name="list-alt"
              size={LARGE_BUTTON_SIZE - 5}
            />
            <TouchableOpacity onPress={navigateProfile}>
              {profilePicture && typeof profilePicture === "string" ? (
                <>
                  <Image
                    source={
                      profilePicture === "" ||
                      !profilePicture.startsWith("https")
                        ? {
                            uri: require("../../assets/pexels-monstera-6373486.jpg"),
                          }
                        : { uri: profilePicture }
                    }
                    style={[
                      styles.circle,
                      {
                        width: LARGE_BUTTON_SIZE - 9,
                        height: LARGE_BUTTON_SIZE - 9,
                        borderWidth: 0.5,
                        borderRadius: 0,
                        aspectRatio: 4 / 3,
                      },
                    ]}
                  />
                </>
              ) : (
                <>
                  <FontAwesomeIcon
                    color={"white"}
                    name="user"
                    size={LARGE_BUTTON_SIZE - 5}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </BlurView>
      )}
    </>
  );
}

function BottomNavigation() {
  const {
    authState: { profilePicture, id, authType },
    authDispatch,
  } = useContext(GlobalContext);
  useEffect(() => {
    (async () => {
      if (!id || !authType) {
        const storageId = await UseTheStorage("id");
        const storageAuthType = await UseTheStorage("authType");
        if (
          storageId &&
          storageAuthType &&
          storageId !== "" &&
          storageAuthType !== ""
        ) {
          authDispatch({
            type: "SET_ID_AND_AUTH_TYPE",
            payload: {
              id: storageId,
              authType: storageAuthType,
            },
          });
          if (!profilePicture) {
            const getProfilePicture = await FormatQuery(
              GetProfilePicture(),
              {},
              `${storageId}:${storageAuthType}`
            );
            if (
              !getProfilePicture ||
              !getProfilePicture.data ||
              !getProfilePicture.data.getUser
            ) {
              return;
            }
            const storageProfilePicture =
              getProfilePicture.data.getUser.profilePicture;
            authDispatch({
              type: "SET_PROFILE_PICTURE",
              payload: storageProfilePicture,
            });
          }
        }
      }
    })();
  }, []);
  const setBtmHeight = (height: number) => {
    height;
    authDispatch({ type: "SET_BTM_HEIGHT", payload: height });
  };
  const insets = useSafeAreaInsets();
  return (
    <>
      <Tab.Navigator
        tabBar={({ navigation }) =>
          BottomNavigator({
            navigation: navigation,
            id: id as string | null,
            authType: authType as string | null,
            setBtmHeight,
            profilePicture: profilePicture as string | null,
            insets,
          })
        }
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarAllowFontScaling: true,
        }}
        // tabBarPosition="bottom"
        initialRouteName="Home"
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Search" component={Search} />
        <Tab.Screen name="Create" component={Create} />
        <Tab.Screen name="Profile" component={Profile} />
        <Tab.Screen name="Login" component={Auth} />
        <Tab.Screen name="Name" component={Name} />
        <Tab.Screen name="Birthday" component={Birthday} />
        <Tab.Screen name="Settings" component={Settings} />
        <Tab.Screen name="Post" component={ViewPost} />
        <Tab.Screen name="Notifications" component={NotificationScreen} />
        <Tab.Screen name="FinalCreate" component={FinalCreate} />
        <Tab.Screen name="BlockedUsers" component={BlockedUsers} />
        <Tab.Screen name="Searched" component={Searched} />
      </Tab.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 0,
    width: "100%",
    alignItems: "center",
    borderRadius: 20,
  },
  buttonContainer: {
    justifyContent: "space-between",
    alignContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    width: "80%",
  },
  circle: {
    width: LARGE_BUTTON_SIZE + 9,
    height: LARGE_BUTTON_SIZE + 9,
    borderRadius: (LARGE_BUTTON_SIZE + 9) / 2,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "white",
    overflow: "hidden",
  },
});

export default BottomNavigation;
