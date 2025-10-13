import { useContext, useEffect, useRef, useState } from "react";
import { IPost } from "./Home";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import ParsePosts from "../components/posts/ParsePosts";
import { SCREEN_HEIGHT } from "../components/lib/constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlobalContext } from "../components/context/Global";
import RenderComments from "../components/posts/RenderComments";
import { BlurView } from "expo-blur";
import { Button, IconButton } from "react-native-paper";
import { GetPostById } from "../api/graphql/Queries";
import InputText from "../components/lib/InputText";
import { FormatMutation, FormatQuery } from "../api/graphql/FormatRequest";
import {
  BlockUser,
  CreateComments,
  LikePost,
  UnLikePost,
} from "../api/graphql/Mutations";
import Container, { Toast } from "toastify-react-native";
import Image from "../components/lib/Image";
import translator from "../components/translations/translator";
import ActionSheet from "react-native-actionsheet";

import Modals from "./modals/Modals";
import SimilarPostRow from "../components/posts/SimilarPostRow";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";

export interface ITiniPost {
  postId: string;
  uri: string;
}

export interface IViewPostProps {
  route: any;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
}

function ViewPost({ route, navigation }: IViewPostProps) {
  const [post, setPost] = useState<IPost | null>(null);
  const [reportModal, setReportModal] = useState<boolean>(false);
  const actionSheetRef = useRef<ActionSheet>(null);
  const {
    authState: { id, authType, isDarkTheme, btmHeight, locale },
  } = useContext(GlobalContext);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    (async () => {
      if (
        !route.params ||
        !route.params.postId ||
        route.params.postId === undefined ||
        typeof route.params.postId !== "string"
      ) {
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate("Home");
        return;
      }
      const authString = id && authType ? `${id}:${authType}` : undefined;
      const getPost = await FormatQuery(
        GetPostById(),
        {
          postId: route.params.postId,
        },
        authString,
        undefined
      );
      if (!getPost || !getPost.data || !getPost.data.getPost) {
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.reset({ index: 0, routes: [{ name: "Home" }] });
        return;
      }
      const post: IPost = getPost.data.getPost;
      setPost(post);
    })();
  }, []);

  const navigateToHashtag = () => {
    if (!post) return;
    if (post.hashtag) {
      navigation.navigate("Home", {
        hashtag: post.hashtag,
      });
    } else {
      navigation.navigate("Home");
    }
  };
  const likePost = async () => {
    if (!post || post.isLiked) {
      return;
    }
    const likePostResult = await FormatMutation(
      post.isLiked ? UnLikePost() : LikePost(),
      {
        postId: post.postId,
      },
      `${id}:${authType}`
    );
    if (
      !likePostResult ||
      !likePostResult.data ||
      !likePostResult.data.likePost
    ) {
      Toast.error(translator(locale).t("error"));
      return;
    }
    Toast.success(translator(locale).t("success"));
    setPost({
      ...post,
      isLiked: !post.isLiked,
      likes: post.isLiked ? post.likes - 1 : post.likes + 1,
    });
  };
  const commentPost = async (text: string) => {
    if (!post || !text || text === "") return;
    Toast.info(translator(locale).t("creatingComment"));
    const authString = id && authType ? `${id}:${authType}` : undefined;
    const newCommentCreated = await FormatMutation(
      CreateComments(),
      {
        postId: post.postId,
        comment: text,
      },
      authString
    );
    if (
      !newCommentCreated ||
      !newCommentCreated.data ||
      !newCommentCreated.data.createComment
    ) {
      Toast.error(translator(locale).t("errorCreatingComment"));
      return;
    }
    Toast.success(translator(locale).t("commentCreated"));
    setPost({
      ...post,
      comments: post.comments + 1,
    });
  };

  const navigateToProfile = () => {
    if (!post) return;
    navigation.navigate("Profile", {
      username: post.username,
    });
  };

  const pressedReport = async (index: number) => {
    if (!post) return;
    if (!id || !authType) {
      navigation.navigate("Login");
      return;
    }
    if (index == 0) {
      setReportModal(true);
    } else if (index == 1) {
      setReportModal(true);
    } else if (index == 2) {
      const didBlock = await FormatMutation(BlockUser(), {
        username: post?.username,
        unblock: false,
      });
      if (!didBlock || !didBlock.data || !didBlock.data.blockUser) {
        return;
      }
      Toast.success(translator(locale).t("userBlocked"));
      return;
    }
  };
  const onEnterText = async (text: string) => {
    if (text === "") {
      return;
    }
  };
  const onPressThreeDots = () => {
    if (actionSheetRef.current) {
      actionSheetRef.current.show();
    }
  };
  return (
    <>
      {post === null ? (
        post
      ) : (
        <View
          style={{
            backgroundColor: isDarkTheme ? "black" : "white",
            width: "100%",
            height: "100%",
            alignContent: "center",
          }}
        >
          <Modal
            visible={reportModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setReportModal(false)}
          >
            <Modals
              title={translator(locale).t("whatwouldyouliketodo")}
              setModalOpen={setReportModal}
              onEnter={onEnterText}
              // customContent={ReportJSX({})}
            />
          </Modal>
          <ActionSheet
            destructiveButtonIndex={3}
            options={[
              translator(locale).t("report"),
              translator(locale).t("reportUser"),
              translator(locale).t("blockUser"),
              translator(locale).t("cancel"),
            ]}
            cancelButtonIndex={3}
            ref={actionSheetRef}
            title={translator(locale).t("reportPost")}
            onPress={pressedReport}
          />
          <Container theme={"dark"} position="top" />
          <BlurView
            intensity={70}
            tint={isDarkTheme ? "dark" : "light"}
            style={{ paddingTop: insets.top }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <IconButton
                icon={"arrow-left"}
                iconColor={isDarkTheme ? "white" : "black"}
                onPress={() => navigation.goBack()}
              />
              <View style={{}}>
                <View style={{ flexDirection: "row" }}>
                  <Image
                    source={
                      post.profilePicture !== ""
                        ? { uri: post.profilePicture }
                        : require("../assets/pexels-monstera-6373486.jpg")
                    }
                    style={styles.profilePicture}
                  />
                  <TouchableOpacity onPress={navigateToProfile}>
                    <Text
                      style={[
                        styles.headerText,
                        {
                          color: isDarkTheme ? "white" : "black",
                          fontSize: 20,
                        },
                      ]}
                    >
                      @{post.username}
                    </Text>
                    <Text style={{ color: isDarkTheme ? "white" : "black" }}>
                      {post.hashtag || null}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View>
                <IconButton
                  icon={"dots-vertical"}
                  iconColor={isDarkTheme ? "white" : "black"}
                  onPress={onPressThreeDots}
                />
              </View>
            </View>
          </BlurView>
          <ScrollView>
            <View style={{ flex: 1 }}>
              <ParsePosts
                navigation={undefined}
                id={post.postId}
                uri={post.uri}
                setContentFilter={undefined}
                height={SCREEN_HEIGHT * 10}
                isPressable={false}
              />
            </View>
            {/* add a white divider */}
            <View style={styles.statsContainer}>
              <Button
                onPress={likePost}
                icon={post.isLiked ? "heart" : "heart-outline"}
                textColor={
                  post.isLiked ? "red" : isDarkTheme ? "white" : "black"
                }
              >
                {post.likes}
              </Button>
              <Button
                onPress={() => {}}
                icon={"eye"}
                textColor={isDarkTheme ? "white" : "black"}
              >
                {post.views}
              </Button>
              <Button
                onPress={() => {}}
                icon={"comment-outline"}
                textColor={isDarkTheme ? "white" : "black"}
              >
                {post.comments}
              </Button>
            </View>

            <Text
              style={[
                styles.headerText,
                { color: "white", marginVertical: 10 },
              ]}
              onPress={navigateToHashtag}
            >
              {translator(locale).t("similarPosts")}
            </Text>
            <View style={{}}>
              <SimilarPostRow navigation={navigation} postId={post.postId} />
            </View>
            <View style={{ height: 15 }} />
            <Text style={[styles.headerText, { color: "white" }]}>
              {translator(locale).t("comments")}
            </Text>
            <RenderComments
              numberOfComments={post.comments}
              postId={post.postId}
              navigation={navigation}
              isDarkTheme={isDarkTheme}
              authString={`${id}:${authType}`}
            />
            <View style={{ height: btmHeight * 2 }} />
          </ScrollView>
          <View style={{ position: "absolute", bottom: 5, width: "100%" }}>
            <InputText
              placeHolderText={translator(locale).t("comment")}
              isDarkTheme={isDarkTheme}
              onPress={commentPost}
              btmHeight={btmHeight}
            />
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {},

  statsContainer: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
    borderBottomColor: "white",
    borderBottomWidth: 0.5,
    width: "80%",
    alignSelf: "center",
  },
  statText: {},
  headerText: {
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
});

export default ViewPost;
