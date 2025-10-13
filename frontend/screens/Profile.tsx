import {
  View,
  StyleSheet,
  Text,
  ImageBackground,
  TouchableOpacity,
  Modal,
} from "react-native";
import {
  PROFILE_FROM_TOP,
  PROFILE_PICTURE_SIZE,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "../components/lib/constants";
import Svg, { Path, Circle } from "react-native-svg";
import Image from "../components/lib/Image";
import { createRef, useContext, useEffect, useState } from "react";
import { Button } from "react-native-paper";
import { SheetManager } from "react-native-actions-sheet";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { shadowStyle } from "../components/lib/Shadow";
import { IPost } from "./Home";
import ParsePosts from "../components/posts/ParsePosts";
import translator from "../components/translations/translator";
import Container, { Toast } from "expo-react-native-toastify";
import * as Haptics from "expo-haptics";
import { NumberToShortForm, ReportSomething } from "../components/lib/Utils";
import { GlobalContext } from "../components/context/Global";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import {
  GetPostsByUsername,
  ProfileByAuth,
  ProfileByUsername,
} from "../api/graphql/Queries";
import { FormatMutation, FormatQuery } from "../api/graphql/FormatRequest";
import Lottie from "lottie-react-native";
import { BlockUser, FollowUser, UnFollowUser } from "../api/graphql/Mutations";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UserPostRow from "../components/posts/UserPostRow";
import ActionSheet from "react-native-actionsheet";
import Modals, { ReportModal, ReportUserModal } from "./modals/Modals";
import { UseTheStorage } from "../components/lib/Storage";

export interface IUser {
  accent: string;
  profilePicture: string;
  backgroundPicture: string;
  username: string;
  rname: string;
  following: number;
  followers: number;
  isVerified: boolean;
  isFollowing?: boolean;
}

export function renderItems(
  item: IPost,
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>,
  width: number = SCREEN_WIDTH,
  height: number = SCREEN_HEIGHT
) {
  return (
    <>
      <TouchableOpacity style={{ zIndex: 99999 }} onPress={() => {}}>
        <ParsePosts
          id={item.postId}
          width={width}
          height={height}
          uri={item.uri}
          hashtag={item.hashtag}
          navigation={navigation}
          setContentFilter={undefined}
          isPressable={true}
        />
      </TouchableOpacity>
    </>
  );
}

const curveHeight = SCREEN_HEIGHT * 0.189; // changed curve height
const circleRadius = SCREEN_HEIGHT / 16;

export interface ProfileProps {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  route: any;
}

function Profile({ navigation, route }: ProfileProps) {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [accent, setAccent] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [backgroundPicture, setBackgroundPicture] = useState<string | null>(
    null
  );
  const [name, setName] = useState<string | undefined>(undefined);
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [username, setUsername] = useState<string | undefined | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [reportModalOpen, setReportModelOpen] = useState<boolean>(false);
  const actionSheetRef = createRef<ActionSheet>();

  const curvePath = `M0 ${curveHeight} Q${SCREEN_WIDTH / 2} ${
    curveHeight / 2
  } ${SCREEN_WIDTH} ${curveHeight} V${SCREEN_HEIGHT} H0 V${SCREEN_HEIGHT}`;

  const {
    authState: { id, authType, authUsername, locale },
    authDispatch,
  } = useContext(GlobalContext);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      const authString = id && authType ? `${id}:${authType}` : undefined;
      if (
        route.params &&
        route.params.username &&
        route.params.username !== "" &&
        route.params.username !== undefined
      ) {
        const fetchUserResult = await FormatQuery(
          ProfileByUsername(),
          {
            username: route.params.username,
          },
          `${id}:${authType}`,
          undefined
        ).catch((error) => {
          Toast.error(translator(locale).t("usernotfound"));
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate("Home");
          return;
        });
        if (!fetchUserResult) {
          Toast.error(translator(locale).t("usernotfound"));
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate("Home");
          return;
        }
        const userObj: IUser = fetchUserResult.data.getUser;
        if (!userObj || !userObj.username) {
          navigation.goBack();
          return;
        }
        setAccent(userObj.accent || "black");
        setProfilePicture(userObj.profilePicture);
        setBackgroundPicture(userObj.backgroundPicture);
        setName(userObj.rname);
        setIsVerified(userObj.isVerified || false);
        setUsername(userObj.username);
        setIsFollowing(userObj.isFollowing || false);
        setFollowers(userObj.followers);
        setFollowing(userObj.following);
        if (userObj.username === authUsername) setIsOwner(true);
        else setIsOwner(false);
        return;
      } else {
        const userFetchResult = await FormatQuery(
          ProfileByAuth(),
          {},
          authString,
          undefined
        ).catch((error) => {
          Toast.error(translator(locale).t("error"));
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate("Home");
        });
        if (
          !userFetchResult ||
          !userFetchResult.data ||
          !userFetchResult.data.getUser
        ) {
          // Toast.error(translator(locale).t("error"));
          // last ditch save attempt
          const id = await UseTheStorage("id");
          const authType = await UseTheStorage("authType");
          if (!id || !authType) {
            Toast.error(translator(locale).t("error"));
            navigation.navigate("Login");
            return;
          }
          const userFetchResult = await FormatQuery(
            ProfileByAuth(),
            {},
            `${id}:${authType}`,
            undefined
          ).catch((error) => {
            Toast.error(translator(locale).t("error"));
            navigation.navigate("Login");
            return;
          });
          if (
            !userFetchResult ||
            !userFetchResult.data ||
            !userFetchResult.data.getUser
          ) {
            Toast.error(translator(locale).t("error"));
            await UseTheStorage("id", "");
            await UseTheStorage("authType", "");
            authDispatch({
              type: "SET_ID_AND_AUTH_TYPE",
              payload: {
                id: null,
                authType: null,
              },
            });
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
            return;
          }
          const userObj: IUser = userFetchResult.data.getUser;
          if (!userObj || !userObj.username) {
            navigation.navigate("Login");
            return;
          }
          setAccent(userObj.accent || "black");
          setProfilePicture(userObj.profilePicture);
          setBackgroundPicture(userObj.backgroundPicture);
          setName(userObj.rname || "User");
          setIsVerified(userObj.isVerified || false);
          setUsername(userObj.username);
          setFollowers(userObj.followers);
          setFollowing(userObj.following);
          setIsOwner(true);
          return;
        }
        const userObj: IUser = userFetchResult.data.getUser;
        if (!userObj || !userObj.username) {
          navigation.navigate("Login");
          return;
        }

        setAccent(userObj.accent || "black");
        setProfilePicture(userObj.profilePicture);
        setBackgroundPicture(userObj.backgroundPicture);
        setName(userObj.rname || "User");
        setIsVerified(userObj.isVerified || false);
        setUsername(userObj.username);
        setFollowers(userObj.followers);
        setFollowing(userObj.following);
        setIsOwner(true);
      }
    })();
  }, []);
  const setbackgroundPicture = (uri: string) => {
    setBackgroundPicture(uri);
  };
  const onFollowEditOrButton = async () => {
    if (!id || !authType) {
      Toast.error("Not logged in");
      return;
    }
    if (isOwner || username === authUsername) {
      if (
        !id &&
        !authType &&
        !accent &&
        !profilePicture &&
        !backgroundPicture &&
        !name
      ) {
        Toast.error(`${translator(locale).t("error")}`);
        return;
      }
      SheetManager.show("editProfile", {
        payload: {
          id: id,
          authType: authType,
          accent: accent,
          name: name,
          profilePicture: profilePicture,
          backgroundPicture: backgroundPicture,
          setAccent: setAccent,
          setbackgroundPicture: setbackgroundPicture,
          setProfilePicture: setProfilePicture,
          setName: setName,
          authDispatch: authDispatch,
          navigation: navigation,
        },
      });
    } else if (username && !isOwner) {
      Toast.info(translator(locale).t("pleaseWait"));
      if (isFollowing) {
        const unfollowUser = await FormatMutation(
          UnFollowUser(),
          {
            toUnFollow: username,
          },
          `${id}:${authType}`
        ).catch((error) => {
          return;
        });
        if (!unfollowUser) {
          Toast.error(translator(locale).t("error"));
          return;
        }
        Toast.success(translator(locale).t("unfollowed"));
        setIsFollowing(!isFollowing);
        setFollowers(followers - 1);
        Haptics.selectionAsync();
        return;
      }
      const followUser = await FormatMutation(
        FollowUser(),
        {
          toFollow: username,
        },
        `${id}:${authType}`
      ).catch((error) => {
        return;
      });
      if (!followUser || !followUser.data || !followUser.data.followUser) {
        Toast.error(translator(locale).t("error"));
        return;
      }
      Toast.success(translator(locale).t("followed"));
      setIsFollowing(true);
      setFollowers(followers + 1);
      Haptics.selectionAsync();
      return;
    }
  };
  const pressedReport = async (index: number) => {
    if (!username) return;
    if (!id || !authType) {
      Toast.error(translator(locale).t("notLoggedIn"));
      return;
    }
    if (index === 0) {
      // report userr
      setReportModelOpen(true);
    } else if (index === 1) {
      // block the user
      const didBlock = await FormatMutation(
        BlockUser(),
        {
          username: username,
          unblock: false,
        },
        `${id}:${authType}`
      );
      if (!didBlock || !didBlock.data || !didBlock.data.blockUser) {
        Toast.error(translator(locale).t("error"));
        return;
      }
      Toast.success(translator(locale).t("blocked"));
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate("Home");
    }
  };
  const onLongPressOfUser = () => {
    if (!actionSheetRef.current || isOwner) return;
    actionSheetRef.current.show();
  };
  const onReportUser = async (values: any) => {
    if (!username || !id || !authType) return;
    const didReport = await ReportSomething(
      values,
      null,
      username,
      null,
      null,
      id,
      authType
    );
    if (!didReport) {
      Toast.error(translator(locale).t("error"));
      return;
    }
    Toast.success(translator(locale).t("reported"));
    setReportModelOpen(false);
  };
  return (
    <>
      <View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: "black" }]}
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor: "black",
            paddingTop: 0,
          },
        ]}
      >
        <ActionSheet
          destructiveButtonIndex={2}
          options={[
            translator(locale).t("reportUser"),
            translator(locale).t("blockUser"),
            translator(locale).t("cancel"),
          ]}
          cancelButtonIndex={2}
          ref={actionSheetRef}
          title={translator(locale).t("reportThisUser")}
          onPress={pressedReport}
        />
        <Modal animationType="slide" transparent visible={reportModalOpen}>
          <ReportUserModal
            title={translator(locale).t("reportUser")}
            setModalOpen={setReportModelOpen}
            onEnter={onReportUser}
          />
        </Modal>
        <Container theme={"dark"} position="top" />
        <ImageBackground
          source={
            typeof backgroundPicture === "string" &&
            backgroundPicture.startsWith("https://")
              ? { uri: backgroundPicture, priority: "high" }
              : require("../assets/pexels-kai-pilger-1341279.jpg")
          }
          style={{
            aspectRatio: 4 / 3,
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT / 5,
          }}
        >
          <Svg style={styles.svg} height={160} width={SCREEN_WIDTH}>
            <Path d={curvePath} fill={"black"} />
          </Svg>
        </ImageBackground>
        <Image
          style={[styles.profilePic, { marginTop: insets.top }]}
          source={
            typeof profilePicture === "string" &&
            profilePicture.startsWith("https://")
              ? { uri: profilePicture, priority: "high" }
              : require("../assets/pexels-monstera-6373486.jpg")
          }
        />
        <View style={{ marginTop: 40 }}>
          <Text style={[styles.nameText, { color: "white" }]}>
            {name ? name : username}
          </Text>
          <View style={{ flexDirection: "row", alignSelf: "center" }}>
            <Text style={[styles.usernameText, { color: "white" }]}>
              @{username}
            </Text>
            {isVerified && (
              <Lottie
                source={require("../assets/checkmark.json")}
                loop={false}
                autoPlay={true}
                style={styles.lottieStyle}
              />
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={{ alignSelf: "center" }}>
              <Text
                style={[
                  {
                    alignSelf: "center",
                    color: "white",
                  },
                ]}
              >
                {NumberToShortForm(followers)}
              </Text>
              <Text style={{ color: "white" }}>
                {translator(locale).t("followers")}
              </Text>
            </View>
            <Button
              onLongPress={onLongPressOfUser}
              onPress={onFollowEditOrButton}
              style={[
                styles.followButton,
                {
                  borderColor: accent || "black",
                  ...shadowStyle("white", 1),
                },
              ]}
              mode="outlined"
              textColor={isFollowing ? "white" : "black"}
              buttonColor={isFollowing ? accent || "black" : "white"}
            >
              {isOwner
                ? translator(locale).t("edit")
                : isFollowing
                ? translator(locale).t("unfollow")
                : translator(locale).t("follow")}
            </Button>
            <View style={{ alignSelf: "center" }}>
              <Text
                style={{
                  alignSelf: "center",
                  color: "white",
                }}
              >
                {NumberToShortForm(following)}
              </Text>
              <Text style={{ color: "white" }}>
                {translator(locale).t("following")}
              </Text>
            </View>
            {/* {isOwner && <IconButton icon={"chart-areaspline-variant"} onPress={() => navigation.navigate('Stats')} size={LARGE_BUTTON_SIZE} iconColor={accent}/>} */}
          </View>
          {username && (
            <UserPostRow
              btmHeight={insets.bottom}
              accent={accent || "black"}
              navigation={navigation}
              username={username}
            />
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "black",
  },
  tabItem: {},
  svg: {
    marginTop: "4%",
    zIndex: 1,
  },
  circleImage: {
    width: circleRadius * 2,
    height: circleRadius * 2,
    borderRadius: circleRadius,
    position: "absolute",
  },
  nameText: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 15,
  },
  usernameText: {
    textAlign: "center",
    paddingBottom: 5,
  },

  followButton: {
    width: "30%",
    alignSelf: "center",
    marginTop: 5,
  },
  rowContainer: {
    borderLeftWidth: 4,
    marginLeft: 10,
    zIndex: 9999,
  },
  lottieStyle: {
    width: 40,
    position: "absolute",
    top: -4,
    right: -10,
  },
  followers: {},
  profilePic: {
    width: PROFILE_PICTURE_SIZE,
    height: PROFILE_PICTURE_SIZE,
    borderRadius: PROFILE_PICTURE_SIZE / 2,
    alignSelf: "center",
    position: "absolute",
    top: PROFILE_FROM_TOP - 5,
    aspectRatio: 4 / 3,
  },
  timeStampText: {
    textAlign: "center",
    fontSize: 20,
    color: "white",
  },
  statsContainer: {
    flexDirection: "row",
    alignSelf: "center",
    width: "100%",
    justifyContent: "space-evenly",
    borderBottomColor: "white",
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  noPostsContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT / 2.2,
    alignItems: "center",
    justifyContent: "center",
  },
  noPostsText: {
    textAlign: "center",
    color: "white",
    width: "100%",
    alignSelf: "center",
    fontSize: 22,
    alignContent: "center",
    textAlignVertical: "center",
    justifyContent: "center",
  },
});

export default Profile;
