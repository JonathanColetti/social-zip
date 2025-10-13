import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { Button, IconButton } from "react-native-paper";
import { ReportSomething, UnixTimeStampToShortForm } from "../lib/Utils";
import { FormatMutation, FormatQuery } from "../../api/graphql/FormatRequest";
import { GetComments } from "../../api/graphql/Queries";
import Image from "../lib/Image";
import React from "react";
import { IComment } from "../../@types/comments";
import translator from "../translations/translator";
import { LikeComment, UnLikeComment } from "../../api/graphql/Mutations";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import Container, { Toast } from "toastify-react-native";
import { ScrollView } from "react-native-gesture-handler";
import { ReportModal, ReportUserModal } from "../../screens/modals/Modals";
import ActionSheet from "react-native-actionsheet";
import { GlobalContext } from "../context/Global";

function RenderComments({
  postId,
  isDarkTheme,
  numberOfComments,
  navigation,
  authString,
}: {
  postId: string;
  isDarkTheme: boolean;
  numberOfComments: number;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  authString: string | undefined;
}) {
  const [comments, setComments] = useState<IComment[]>([]);
  const [page, setPage] = useState<number>(0);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [reportUserModalOpen, setReportUserModalOpen] =
    useState<boolean>(false);
  const actionSheetRef = React.useRef<ActionSheet>(null);
  const {
    authState: { locale },
  } = useContext(GlobalContext);
  const getMoreComments = async () => {
    if (comments.length >= numberOfComments) {
      return;
    }
    const fetchedMoreComments = await FormatQuery(
      GetComments(),
      {
        postId: postId,
        pageNum: page,
      },
      undefined
    );
    if (
      !fetchedMoreComments ||
      !fetchedMoreComments.data ||
      !fetchedMoreComments.data.getComments
    ) {
      Toast.error(translator(locale).t("failedToGetMoreComments"));
      return;
    }
    const moreComments = fetchedMoreComments.data.getComments;
    setPage(page + 1);
    setComments([...comments, ...fetchedMoreComments.data.getComments]);
  };

  useEffect(() => {
    getMoreComments();
  }, []);

  const textColor = isDarkTheme ? "white" : "black";
  const onReportComment = (index: number) => {
    if (index === 0) {
      setReportModalOpen(true);
      return;
    }
  };
  const onLongPressOfUser = () => {};

  const pressedReport = () => {
    if (actionSheetRef.current) {
      actionSheetRef.current.show();
    }
  };

  const reportComment = () => {
    setReportModalOpen(true);
  };
  const reportTheComment = async (values: any, commentId: string) => {
    if (!authString) {
      navigation.navigate("Login");
      return;
    }
    const splitedAuthString = authString.split(":");
    const id = splitedAuthString[0];
    const authType = splitedAuthString[1];
    const didReport = await ReportSomething(
      values,
      null,
      null,
      commentId,
      null,
      id,
      authType
    );
    if (didReport) {
      Toast.success(translator(locale).t("reportedComment"));
    } else {
      Toast.error(translator(locale).t("pleasetryagain"));
    }
    setReportModalOpen(false);
  };

  const reportTheUser = async (values: any, username: string) => {
    if (!authString) {
      navigation.navigate("Login");
      return;
    }
    const splitedAuthString = authString.split(":");
    const id = splitedAuthString[0];
    const authType = splitedAuthString[1];
    const didReport = await ReportSomething(
      values,
      null,
      username,
      null,
      null,
      id,
      authType
    );
    if (didReport) {
      Toast.success(translator(locale).t("reportedUser"));
    } else {
      Toast.error(translator(locale).t("pleasetryagain"));
    }
    setReportUserModalOpen(false);
  };
  const renderComment = ({ item }: { item: IComment }) => {
    const likeComment = async () => {
      Toast.info(translator(locale).t("updatingComment"));
      if (!authString) {
        navigation.navigate("Login");
        return;
      }
      const newComments = comments.map(async (comment: IComment | null) => {
        if (!comment) return null;
        if (comment.commentId === item.commentId) {
          if (comment.isLiked) {
            const unlikeCommentResult = await FormatMutation(
              UnLikeComment(),
              {
                commentId: item.commentId,
              },
              authString
            );
            if (
              !unlikeCommentResult ||
              !unlikeCommentResult.data ||
              !unlikeCommentResult.data.unlikeComment
            ) {
              Toast.error(translator(locale).t("failedToUnlikeComment"));
              return null;
            }
            Toast.success(translator(locale).t("unlikedComment"));
            return {
              ...comment,
              isLiked: false,
              likes: comment.likes - 1,
            };
          }
          const likeCommentResult = await FormatMutation(
            LikeComment(),
            {
              commentId: item.commentId,
            },
            authString
          );
          if (
            !likeCommentResult ||
            !likeCommentResult.data ||
            !likeCommentResult.data.likeComment
          ) {
            Toast.error(translator(locale).t("failedToLikeComment"));
            return null;
          }
          Toast.success(translator(locale).t("likedComment"));
          return {
            ...comment,
            isLiked: true,
            likes: comment.likes + 1,
          };
        }
        return comment;
      });
      const newCommentsResolved = await Promise.all(newComments);
      if (!newCommentsResolved) return false;
      const cleanedComments = newCommentsResolved.filter(
        (comment: IComment | null) => comment
      ) as IComment[];
      setComments(cleanedComments);
    };
    const onLongPressOfCommentToReport = () => {};

    const onPressOfUser = () => {
      navigation.navigate("Profile", { username: item.username });
    };

    return (
      <TouchableOpacity
        onLongPress={onLongPressOfCommentToReport}
        style={styles.commentContainer}
        key={item.commentId}
      >
        <TouchableOpacity
          onPress={onPressOfUser}
          onLongPress={onLongPressOfUser}
          style={styles.profilePictureContainer}
        >
          <Modal
            animationType="slide"
            visible={reportModalOpen}
            transparent={true}
          >
            <ReportModal
              onEnter={(values: any) =>
                reportTheComment(values, item.commentId)
              }
              title={translator(locale).t("reportComments")}
              setModalOpen={setReportModalOpen}
            />
          </Modal>
          <Modal
            animationType="slide"
            visible={reportUserModalOpen}
            transparent={true}
          >
            <ReportUserModal
              onEnter={(values: any) => reportTheComment(values, item.username)}
              title={translator(locale).t("reportUser")}
              setModalOpen={setReportUserModalOpen}
            />
          </Modal>
          <Image
            source={
              item.profilePicture !== ""
                ? { uri: item.profilePicture }
                : require("../../assets/pexels-kai-pilger-1341279.jpg")
            }
            style={styles.profilePictureStyle}
          />
          <Text
            style={{
              color: textColor,
              textAlign: "left",
            }}
          >
            {" "}
            @{item.username} |{" "}
            {UnixTimeStampToShortForm(item.timestamp, locale)}
          </Text>
        </TouchableOpacity>
        <ScrollView>
          <Text style={{ color: textColor, textAlign: "left", padding: 10 }}>
            {item.comment}
          </Text>
        </ScrollView>
        <View style={{ flexDirection: "row", width: "100%" }}>
          <TouchableOpacity
            style={{ flexDirection: "row" }}
            onPress={likeComment}
          >
            <Button
              icon={item.isLiked ? "heart" : "heart-multiple-outline"}
              textColor={item.isLiked ? "red" : textColor}
              onPress={likeComment}
            >
              {item.likes}
            </Button>
            {/* put a button at end of row */}
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <IconButton
              icon={"dots-vertical"}
              iconColor={"white"}
              onPress={pressedReport}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View style={{ width: "100%" }}>
        <Container theme={"dark"} position="top" />
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
          onPress={onReportComment}
        />
        {comments && comments.length > 0 ? (
          <>
            <FlatList
              data={comments}
              renderItem={renderComment}
              scrollEnabled={false}
              keyExtractor={(item) => item.commentId}
              initialNumToRender={10}
              windowSize={10}
              maxToRenderPerBatch={10}
              onEndReached={getMoreComments}
            />
          </>
        ) : (
          <>
            <View
              style={{
                width: "100%",
                height: "100%",
                alignContent: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: textColor, textAlign: "center" }}>
                {translator(locale).t("beTheFirstToComment")}
              </Text>
            </View>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  profilePictureContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  profilePictureStyle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 10,
    aspectRatio: 4 / 3,
  },
  commentContainer: {
    backgroundColor: "black",
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
  },
});

export default RenderComments;
