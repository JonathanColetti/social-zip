import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
} from "react-native";
import { GlobalContext } from "../components/context/Global";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BACKEND_URL,
  CAROUSEL_HEIGHT,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "../components/lib/constants";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { IconButton } from "react-native-paper";
import ParsePosts from "../components/posts/ParsePosts";
import {
  NumberToShortForm,
  ReportSomething,
  UnixTimeStampToShortForm,
} from "../components/lib/Utils";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ActionSheet from "react-native-actionsheet";
import Image from "../components/lib/Image";
import { FormatQuery } from "../api/graphql/FormatRequest";
import {
  GetFollowingPosts,
  GetPosts,
  GetPostsByHashtag,
} from "../api/graphql/Queries";
import translator from "../components/translations/translator";
import TopHashtagNavigation from "../components/navigation/TopHashtagNavigation";
import Container, { Toast } from "toastify-react-native";
import { ReportModal, ReportUserModal } from "./modals/Modals";
import FriendRow from "../components/search/FriendRow";
import { UseTheStorage } from "../components/lib/Storage";
export interface IContentFilter {
  isPinned: boolean;
  hashtag: string;
}

export interface IPost {
  postId: string;
  uri: string;
  name: string;
  username: string;
  profilePicture: string;
  title?: string;
  hashtag?: string;
  views: number;
  likes: number;
  comments: number;
  isLiked: boolean;
  timestamp: string;
}
export interface HomeProps {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  route: {
    params: {
      postId: string;
      username: string;
      hashtag: string;
    };
  };
}

function Home({ navigation, route }: any) {
  const {
    authState: { btmHeight, id, authType, locale },
    authDispatch,
  } = useContext(GlobalContext);

  const [contentFilter, setContentFilter] = useState<IContentFilter>(
    route.params && route.params.hashtag
      ? { hashtag: route.params.hashtag, isPinned: false }
      : { hashtag: translator(locale).t("following"), isPinned: false }
  );
  const [posts, setPosts] = useState<IPost[]>([]);
  const [postPageNum, setPostPageNum] = useState<number>(0);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [reportUserModalOpen, setReportUserModalOpen] =
    useState<boolean>(false);
  const actionSheetRef = useRef<ActionSheet>(null);

  const getMorePosts = (): void => {
    getPosts(true);
    return;
  };

  useEffect(() => {
    UseTheStorage("locale").then((slocale) => {
      if (slocale && slocale !== locale) {
        authDispatch({ type: "SET_LOCALE", payload: slocale });
      }
    });
  }, []);

  useEffect(() => {
    setPosts([]);
    setPostPageNum(0);
  }, [contentFilter]);

  useEffect(() => {
    if (posts.length === 0) getPosts();
  }, [posts]);

  useEffect(() => {
    if (!id || !authType) {
      return;
    }
    getPosts();
  }, [id, authType]);

  const getPosts = async (append: boolean = false): Promise<void> => {
    if (!contentFilter) {
      return;
    }
    let returnPosts: IPost[] = [];
    if (contentFilter.hashtag === translator(locale).t("following")) {
      if (!id || !authType) {
        return;
      }
      const nposts = await FormatQuery(
        GetFollowingPosts(),
        {
          pageNum: posts.length > 0 ? postPageNum : 0,
        },
        `${id}:${authType}`,
        undefined
      );
      if (!nposts || !nposts.data || !nposts.data.getFollowingPosts) {
        Toast.error(translator(locale).t("failedToGetPosts"));
        return;
      }
      returnPosts = nposts.data.getFollowingPosts;
    } else if (contentFilter.hashtag === translator(locale).t("explore")) {
      const nposts = await FormatQuery(
        GetPosts(),
        {
          pageNum: posts.length > 0 ? postPageNum : 0,
        },
        id && authType ? `${id}:${authType}` : undefined
      );
      if (!nposts || !nposts.data || !nposts.data.getPosts) {
        return;
      }
      returnPosts = nposts.data.getPosts;
    } else {
      const nposts = await FormatQuery(
        GetPostsByHashtag(),
        {
          hashtag: contentFilter.hashtag,
          pageNum: posts.length > 0 ? postPageNum : 0,
        },
        id && authType && id !== "" && authType !== ""
          ? `${id}:${authType}`
          : undefined
      );

      if (!nposts || !nposts.data || !nposts.data.getPostsByHashtag) {
        return;
      }
      returnPosts = nposts.data.getPostsByHashtag;
    }

    if (returnPosts.length <= 0) {
      return;
    }
    if (append) {
      setPosts([...posts, ...returnPosts]);
      setPostPageNum(postPageNum + 1);
      return;
    }
    setPosts(returnPosts);
    setPostPageNum(1);
  };

  const pressedReport = async (index: number) => {
    if (index == 0) setReportModalOpen(true);
    else if (index == 1) setReportUserModalOpen(true);
  };

  const onPressReport = () => {
    if (actionSheetRef.current) {
      actionSheetRef.current.show();
    }
  };

  const onReportPost = async (values: any, postId: string): Promise<void> => {
    Toast.info(translator(locale).t("reportingPost"));
    const didReport = await ReportSomething(
      values,
      postId,
      null,
      null,
      null,
      id,
      authType
    );
    if (!didReport) {
      Toast.error(translator(locale).t("failedToReportPost"));
      setReportModalOpen(false);
      return;
    }
    Toast.success(translator(locale).t("reportedPost"));
    setReportModalOpen(false);
  };
  const onReportUser = async (values: any, username: string): Promise<void> => {
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
      Toast.error(translator(locale).t("failedToReportUser"));
      setReportUserModalOpen(false);
      return;
    }
    Toast.success(translator(locale).t("reportedUser"));
    setReportUserModalOpen(false);
  };
  const renderPostItem = ({ item, index }: { item: IPost; index: number }) => {
    const onPressUser = () => {
      navigation.navigate("Profile", {
        username: item.username,
      });
    };
    return (
      <>
        <View
          style={{ borderColor: "white", borderWidth: 1, borderRadius: 20 }}
          key={item.postId}
        >
          <Modal
            animationType="slide"
            visible={reportModalOpen}
            transparent={true}
          >
            <ReportModal
              onEnter={(values: any) => onReportPost(values, item.postId)}
              title={translator(locale).t("reportPost")}
              setModalOpen={setReportModalOpen}
            />
          </Modal>
          <Modal
            animationType="slide"
            visible={reportUserModalOpen}
            transparent={true}
          >
            <ReportUserModal
              onEnter={(values: any) => onReportUser(values, item.username)}
              title={translator(locale).t("reportUser")}
              setModalOpen={setReportUserModalOpen}
            />
          </Modal>
          <TouchableOpacity
            onLongPress={() => {}}
            onPress={onPressUser}
            style={{ flexDirection: "row" }}
          >
            <Image
              source={
                item.profilePicture === ""
                  ? require("../assets/pexels-monstera-6373486.jpg")
                  : { uri: item.profilePicture }
              }
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.nameText}>{item.name}</Text>
                <Text style={styles.dateText}>
                  {UnixTimeStampToShortForm(item.timestamp, locale)}{" "}
                </Text>
                <MaterialCommunityIcons
                  name={"eye"}
                  size={15}
                  color={"white"}
                  style={styles.iconButtonStyle}
                />
                <Text
                  style={[
                    styles.dateText,
                    { fontSize: 11, alignSelf: "center" },
                  ]}
                >
                  {NumberToShortForm(item.views)}{" "}
                </Text>
                <MaterialCommunityIcons
                  name={"heart-multiple-outline"}
                  size={15}
                  color={"white"}
                  style={styles.iconButtonStyle}
                />
                <Text
                  style={[
                    styles.dateText,
                    { fontSize: 11, alignSelf: "center" },
                  ]}
                >
                  {NumberToShortForm(item.likes)}{" "}
                </Text>
                <MaterialCommunityIcons
                  name={"comment-multiple-outline"}
                  size={15}
                  color={"white"}
                  style={styles.iconButtonStyle}
                />
                <Text
                  style={[
                    styles.dateText,
                    { fontSize: 11, alignSelf: "center" },
                  ]}
                >
                  {NumberToShortForm(item.comments)}{" "}
                </Text>
              </View>

              <Text
                onPress={onPressUser}
                style={{ color: "white", fontSize: 14, marginLeft: 5 }}
              >
                @{item.username}
              </Text>
            </View>
            <View style={styles.threeDotsContainer}>
              <IconButton
                icon={"dots-vertical"}
                iconColor={"white"}
                size={13}
                onPress={onPressReport}
              />
            </View>
          </TouchableOpacity>
        </View>
        <ParsePosts
          id={item.postId}
          navigation={navigation}
          uri={item.uri}
          setContentFilter={undefined}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT / 4}
          isPressable
        />
      </>
    );
  };

  return (
    <>
      <View style={[styles.container]}>
        <ActionSheet
          destructiveButtonIndex={2}
          options={[
            translator(locale).t("report"),
            translator(locale).t("reportUser"),
            translator(locale).t("cancel"),
          ]}
          cancelButtonIndex={2}
          ref={actionSheetRef}
          title={translator(locale).t("reportThisPost")}
          onPress={pressedReport}
        />

        <TopHashtagNavigation
          setContentFilter={setContentFilter}
          startingFilter={
            route.params && route.params.hashtag
              ? { hashtag: route.params.hashtag, isPinned: false }
              : null
          }
          contentFilter={contentFilter || { hashtag: "", isPinned: false }}
        />
        {/* </View> */}
        <View
          style={[
            styles.contentContainer,
            { marginTop: CAROUSEL_HEIGHT, marginBottom: btmHeight + 40 },
          ]}
        >
          {posts.length > 0 ? (
            <FlatList
              data={posts}
              keyExtractor={(item) => item.postId}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={4}
              renderItem={renderPostItem}
              contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: btmHeight * 2,
              }}
              onEndReachedThreshold={0.5}
              onEndReached={getMorePosts}
              getItemLayout={(data, index) => ({
                length: SCREEN_HEIGHT,
                offset: (SCREEN_HEIGHT / 4) * index,
                index,
              })}
            />
          ) : (
            <>
              <View style={styles.loadingOrNoPostFoundContainer}>
                {contentFilter.hashtag === translator(locale).t("following") ? (
                  <>
                    <FriendRow navigation={navigation} authString={undefined} />
                  </>
                ) : (
                  <Text style={styles.noPostsText}>
                    {translator(locale).t("noPostsFound")}
                  </Text>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "black",
  },
  nameText: {
    color: "white",
    fontWeight: "bold",
  },
  dateText: {
    color: "white",
    marginLeft: 5,
    fontWeight: "300",
  },
  topRow: {
    height: "40%",
    maxHeight: "40%",
    width: SCREEN_WIDTH,
    marginTop: "4%",
    position: "absolute",
    alignSelf: "center",
  },
  contentContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: "absolute",
    zIndex: -1,
  },
  loadingOrNoPostFoundContainer: {
    width: "100%",
    height: "80%",
    alignContent: "center",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  noPostContainer: {
    width: "100%",
    height: "80%",
    alignContent: "center",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  noPostsText: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
  },
  threeDotsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  iconButtonStyle: {
    marginTop: 2,
    marginLeft: 2,
  },
});

export default Home;
