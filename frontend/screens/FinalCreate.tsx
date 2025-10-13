import { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../components/lib/constants";
import ParsePosts from "../components/posts/ParsePosts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddHashtag from "./AddHashtag";
import { FormatMutation } from "../api/graphql/FormatRequest";
import { CreatePost } from "../api/graphql/Mutations";
import _ from "lodash";
import translator from "../components/translations/translator";
import Container, { Toast } from "expo-react-native-toastify";
import { ChangeLocalUriToRemoteUriInHtml } from "../components/lib/UploadFile";
import { GlobalContext } from "../components/context/Global";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";

function FinalCreate({
  navigation,
  route,
}: {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  route: any;
}) {
  const {
    authState: { id, authType, locale },
  } = useContext(GlobalContext);

  const onUploadHashtag = async (hashtag: string) => {
    Toast.info(translator(locale).t("uploading"));
    const changedHtml = await ChangeLocalUriToRemoteUriInHtml(route.params.uri);
    const mutationResult = await FormatMutation(
      CreatePost(),
      {
        uri: changedHtml,
        hashtag: hashtag,
      },
      id && authType ? `${id}:${authType}` : undefined
    ).catch((err) => {
      Toast.error(translator(locale).t("pleasetryagain"));
      return;
    });
    if (
      !mutationResult ||
      !mutationResult.data ||
      !mutationResult.data.createPost
    ) {
      Toast.error(translator(locale).t("pleasetryagain"));
      return;
    }
    Toast.success(translator(locale).t("success"));
    const postId = mutationResult.data.createPost;

    navigation.reset({
      index: 0,
      routes: [{ name: "Post", params: { postId: postId } }],
    });
    return;
  };

  const insets = useSafeAreaInsets();
  return (
    <>
      <View
        style={[
          {
            backgroundColor: "black",
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
          },
          { paddingTop: insets.top },
        ]}
      >
        <Container theme={"dark"} position="top" />

        <ParsePosts
          uri={route.params.uri}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT / 1.5}
          id="leggomyeggo"
          navigation={undefined}
          setContentFilter={undefined}
        />
        <View style={{ height: 30 }} />
        <AddHashtag navigation={navigation} onAdd={onUploadHashtag} />
      </View>
    </>
  );
}

export default FinalCreate;
