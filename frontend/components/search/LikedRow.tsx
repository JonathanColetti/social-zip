import { useContext, useEffect, useState } from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";
import { renderPostCard } from "./PostRow";
import { REALLY_LARGE_FONT, SCREEN_WIDTH } from "../lib/constants";
import translator from "../translations/translator";
import { IPost } from "../../screens/Home";
import { FormatQuery } from "../../api/graphql/FormatRequest";
import { GetLikedPosts } from "../../api/graphql/Queries";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { GlobalContext } from "../context/Global";

function LikedRow({
  navigation,
  authString,
}: {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  authString: string | undefined;
}) {
  const [likedPosts, setLikedPosts] = useState<IPost[]>([]);
  const [pageNum, setPageNum] = useState<number>(0);
  const {
    authState: { locale },
  } = useContext(GlobalContext);

  const getMoreLikedPosts = async () => {
    const posts = await FormatQuery(
      GetLikedPosts(),
      {
        pageNum: pageNum,
      },
      authString
    );
    if (!posts || !posts.data || !posts.data.getLikedPosts) {
      return;
    }
    setLikedPosts([...likedPosts, ...posts.data.getLikedPosts]);
    setPageNum(pageNum + 1);
  };
  useEffect(() => {
    if (likedPosts.length === 0) getMoreLikedPosts();
  }, []);
  return (
    <>
      <View>
        <Text style={styles.headerText}>
          {translator(locale).t("likedPosts")}
        </Text>
        {likedPosts.length > 0 ? (
          <FlatList
            data={likedPosts}
            renderItem={(item) =>
              renderPostCard({ item: item.item, navigation })
            }
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            showsHorizontalScrollIndicator={false}
            initialNumToRender={5}
            horizontal
            keyExtractor={(item) => item.postId}
            getItemLayout={(data, index) => ({
              length: (SCREEN_WIDTH + 10) / 3,
              offset: (SCREEN_WIDTH / 3 + 10) * index,
              index,
            })}
            onEndReached={getMoreLikedPosts}
            onEndReachedThreshold={0.5}
          />
        ) : (
          <Text style={{ color: "white", alignSelf: "center" }}>
            {translator(locale).t("noLikedPosts")}
          </Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: REALLY_LARGE_FONT,
    fontWeight: "bold",
    color: "white",
    borderBottomWidth: 1,
    borderBottomColor: "white",
    alignSelf: "center",
    width: "80%",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 10,
  },
});

export default LikedRow;
