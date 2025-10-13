import { ResizeMode, Video } from "expo-av";
import {
  ImageBackground,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import Image from "../lib/Image";
import { useContext, useState } from "react";
import {
  PROFILE_POST_PICTURE_SIZE,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "../lib/constants";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import {
  UnixTimeStampToShortForm,
  customHTMLElementModels,
} from "../lib/Utils";
import {
  Edge,
  EdgeInsets,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import React from "react";
import { GlobalContext } from "../context/Global";
import { ProfileCardSnapView } from "./ProfileCards";
import RenderHTML, {
  HTMLElementModel,
  HTMLContentModel,
  domNodeToHTMLString,
} from "react-native-render-html";
import WebView from "react-native-webview";
import YoutubePlayer from "react-native-youtube-iframe";
import FastImage from "../lib/Image";
import RenderTheHtml from "./RenderTheHtml";
import { IPost } from "../../screens/Home";

export interface ParsePostsProps {
  id: string;
  navigation:
    | NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>
    | undefined;
  uri: string;
  setContentFilter: any;
  hashtag?: string;
  width?: number;
  height?: number;
  isPressable?: boolean;
  isHorizontal?: boolean;
  isScrollable?: boolean;
}

function ParsePosts({
  uri,
  id,
  navigation,
  width = SCREEN_WIDTH,
  height = SCREEN_HEIGHT,
  isPressable = true,
  isHorizontal = false,
  isScrollable = true,
}: ParsePostsProps) {
  const navigateToPost = () => {
    if (!isPressable || navigation === undefined) return;
    navigation.reset({
      index: 0,
      routes: [{ name: "Post", params: { postId: id } }],
    });
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={isPressable ? 0.2 : 1}
        onPress={navigateToPost}
        style={{ maxHeight: height, maxWidth: width }}
        key={id}
      >
        {isScrollable ? (
          <>
            <ScrollView
              horizontal={isHorizontal}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              style={styles.scrollViewContainer}
            >
              <RenderTheHtml uri={uri} />
            </ScrollView>
          </>
        ) : (
          <ScrollView style={styles.nonScrollableContainer}>
            <RenderTheHtml uri={uri} />
          </ScrollView>
        )}
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    backgroundColor: "black",
    borderColor: "white",
    borderBottomWidth: 0.4,
    alignSelf: "center",
    width: "100%",
    maxWidth: "100%",
    minHeight: SCREEN_HEIGHT / 6,
  },
  nonScrollableContainer: {
    backgroundColor: "black",
    borderColor: "white",
    borderBottomWidth: 0.4,
    alignSelf: "center",
    width: "100%",
    maxWidth: "100%",
    minHeight: SCREEN_HEIGHT / 6,
    maxHeight: SCREEN_HEIGHT / 4,
  },
});

export default React.memo(ParsePosts);
