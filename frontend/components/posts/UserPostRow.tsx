import { useContext, useEffect, useState } from "react";
import { IPost } from "../../screens/Home";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import translator from "../translations/translator";
import ParsePosts from "./ParsePosts";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../lib/constants";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { UnixTimeStampToShortForm } from "../lib/Utils";
import { FormatQuery } from "../../api/graphql/FormatRequest";
import { GetPostsByUsername } from "../../api/graphql/Queries";
import { shadowStyle } from "../../components/lib/Shadow";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { GlobalContext } from "../context/Global";
function UserPostRow({
  username,
  navigation,
  accent,
  btmHeight,
}: {
  username: string;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  accent: string;
  btmHeight: number;
}) {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [page, setPage] = useState<number>(0);
  const {
    authState: { locale },
  } = useContext(GlobalContext);
  const styles = style(accent);
  useEffect(() => {
    getMorePosts();
  }, []);
  const renderDetail = (
    rowData: IPost,
    _sectionID: unknown,
    _rowID: unknown
  ) => {
    if (!rowData) return <></>;
    const onPress = () => {
      navigation.navigate("Post", { postId: rowData.postId });
    };
    return (
      <View style={{ zIndex: 99999999 }}>
        <TouchableOpacity
          style={[styles.rowContainer, { borderColor: accent }]}
          onPress={onPress}
        >
          <View style={[styles.tabContainer]}>
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  alignItems: "center",
                  ...shadowStyle(accent, 4),
                }}
              >
                <Text style={[{ color: "white" }, styles.timeStampText]}>
                  {UnixTimeStampToShortForm(rowData.timestamp, locale)}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    width: SCREEN_WIDTH,
                    position: "absolute",
                  }}
                >
                  <MaterialCommunityIcons
                    name={"heart-multiple-outline"}
                    size={15}
                    color={"white"}
                    style={styles.tabItem}
                  />
                  <Text style={[{ color: "white" }, styles.tabText]}>
                    {rowData.likes}{" "}
                  </Text>
                  <MaterialCommunityIcons
                    name={"comment-multiple-outline"}
                    size={15}
                    color={"white"}
                    style={styles.tabItem}
                  />
                  <Text style={[{ color: "white" }, styles.tabText]}>
                    {rowData.comments}{" "}
                  </Text>
                  <MaterialCommunityIcons
                    name={"eye"}
                    size={15}
                    color={"white"}
                    style={styles.tabItem}
                  />
                  <Text style={[{ color: "white" }, styles.tabText]}>
                    {rowData.views}{" "}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ marginLeft: 10 }}>
            <ParsePosts
              id={rowData.postId}
              uri={rowData.uri}
              navigation={navigation}
              width={SCREEN_WIDTH}
              height={SCREEN_HEIGHT / 4}
              setContentFilter={undefined}
              hashtag={rowData.hashtag}
              isScrollable={false}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  const getMorePosts = async () => {
    const postsResult = await FormatQuery(
      GetPostsByUsername(),
      {
        username: username,
        pageNum: page,
      },
      undefined,
      undefined
    );
    if (!postsResult || !postsResult.data || !postsResult.data.getUserPosts) {
      return;
    }
    if (postsResult.data.getUserPosts.length === 0) {
      return;
    }

    setPosts([...posts, ...postsResult.data.getUserPosts]);
    setPage(page + 1);
    return;
  };

  return (
    <>
      {posts && posts.length === 0 ? (
        <>
          <View style={styles.noPostsContainer}>
            <Text style={styles.noPostsText}>
              {translator(locale).t("noPosts")}
            </Text>
          </View>
        </>
      ) : (
        <>
          <FlatList
            data={posts}
            renderItem={({ item }) => renderDetail(item, 0, 0)}
            keyExtractor={(item) => item.postId + "1"}
            style={{
              height: SCREEN_HEIGHT - btmHeight - SCREEN_HEIGHT / 2.3,
              zIndex: 99999999,
              backgroundColor: "black",
            }}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
            onEndReachedThreshold={0.5}
            onEndReached={getMorePosts}
          />
        </>
      )}
    </>
  );
}

const style = (accent: string) =>
  StyleSheet.create({
    noPostsContainer: {},
    noPostsText: {},
    rowContainer: {
      flex: 1,
      width: "100%",
    },
    timeStampText: {
      fontSize: 20,
      color: "white",
      ...shadowStyle(accent),
    },
    tabItem: {
      ...shadowStyle(accent),
    },
    tabContainer: {
      flexDirection: "row",
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      backgroundColor: "black",
    },
    tabText: {
      // fontSize: 11,
      alignSelf: "center",
    },
  });

export default UserPostRow;
