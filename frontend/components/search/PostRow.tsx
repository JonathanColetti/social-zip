import { View, Text, FlatList, StyleSheet } from "react-native";
import { REALLY_LARGE_FONT, SCREEN_WIDTH } from "../lib/constants";
import translator from "../translations/translator";
import { IPost } from "../../screens/Home";
import { useContext, useEffect, useState } from "react";
import { FormatQuery } from "../../api/graphql/FormatRequest";
import { GetPopularPosts } from "../../api/graphql/Queries";
import { IMiniPost } from "../../screens/Search";
import ParsePosts from "../posts/ParsePosts";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { GlobalContext } from "../context/Global";

const renderPostCard = ({
  item,
  navigation,
  keyPadding,
}: {
  item: IMiniPost;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  keyPadding?: string;
}) => {
  return (
    <>
      <View
        style={{
          borderColor: "white",
          borderWidth: 0.6,
          minWidth: SCREEN_WIDTH / 3,
          minHeight: SCREEN_WIDTH / 3,
        }}
      >
        <ParsePosts
          id={item.postId}
          navigation={navigation}
          uri={item.uri}
          setContentFilter={undefined}
          width={SCREEN_WIDTH / 3}
          height={SCREEN_WIDTH / 3}
        />
      </View>
    </>
  );
};

function PostRow({
  navigation,
  authString,
}: {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  authString: string | undefined;
}): JSX.Element {
  const [popularPosts, setPopularPosts] = useState<IPost[]>([]);
  const [pageNum, setPageNum] = useState<number>(0);
  const {
    authState: { locale },
  } = useContext(GlobalContext);

  useEffect(() => {
    getPopularPosts();
  }, []);

  const getPopularPosts = async (append: boolean = true) => {
    const posts = await FormatQuery(
      GetPopularPosts(),
      {
        pageNum: pageNum,
      },
      authString
    );
    if (!posts || !posts.data || !posts.data.getPopularPosts) {
      return;
    }
    if (posts.data.getPopularPosts.length === 0) {
      return;
    }
    if (!append) {
      setPopularPosts(posts.data.getPopularPosts);
      return;
    }
    setPopularPosts([...popularPosts, ...posts.data.getPopularPosts]);
    setPageNum(pageNum + 1);
  };

  return (
    <>
      <View>
        <Text style={styles.headerText}>
          {translator(locale).t("popularPosts")}
        </Text>
        {popularPosts.length <= 0 ? (
          <>
            <Text style={{ color: "white", textAlign: "center" }}>
              {translator(locale).t("noPopularPosts")}
            </Text>
          </>
        ) : (
          <>
            <FlatList
              data={popularPosts}
              renderItem={(item) =>
                renderPostCard({ item: item.item, navigation })
              }
              initialNumToRender={6}
              horizontal
              windowSize={6}
              maxToRenderPerBatch={6}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
              keyExtractor={(item) => item.postId}
              onEndReached={() => getPopularPosts()}
              onEndReachedThreshold={0.3}
              getItemLayout={(data, index) => ({
                length: SCREEN_WIDTH / 3 + 20,
                offset: SCREEN_WIDTH / 3 + 20 * index,
                index,
              })}
            />
          </>
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

export { renderPostCard };
export default PostRow;
