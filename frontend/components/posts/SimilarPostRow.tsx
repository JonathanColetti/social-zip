import { FlatList, View, StyleSheet } from "react-native";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../lib/constants";
import ParsePosts from "./ParsePosts";
import { useEffect, useState } from "react";
import { ISmallPost } from "../../screens/Notifications";
import { FormatQuery } from "../../api/graphql/FormatRequest";
import { GetSimilarPosts } from "../../api/graphql/Queries";
import { ITiniPost } from "../../screens/ViewPost";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";

function SimilarPostRow({
  postId,
  navigation,
}: {
  postId: string;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
}) {
  const [similarPosts, setSimilarPosts] = useState<ISmallPost[]>([]);
  const [page, setPage] = useState<number>(0);
  useEffect(() => {
    if (similarPosts.length <= 0) getSimilarPosts();
  }, []);
  const getSimilarPosts = async () => {
    const similarPostsResult = await FormatQuery(GetSimilarPosts(), {
      postId: postId,
      pageNum: page,
    });
    if (
      !similarPostsResult ||
      !similarPostsResult.data ||
      !similarPostsResult.data.similarPosts ||
      similarPostsResult.data.similarPosts.length === 0
    ) {
      return;
    }
    setSimilarPosts([...similarPosts, ...similarPostsResult.data.similarPosts]);
    setPage(page + 1);
    return;
  };

  const renderSimilarPosts = ({ item }: { item: ISmallPost }) => {
    return (
      <>
        <View key={item.postId}>
          <ParsePosts
            navigation={navigation}
            id={item.postId}
            uri={item.uri}
            setContentFilter={undefined}
            height={SCREEN_HEIGHT / 4}
            width={SCREEN_WIDTH / 1.5}
            isPressable={true}
            isHorizontal
            isScrollable={false}
          />
        </View>
      </>
    );
  };
  return (
    <>
      <View style={styles.similarPostsContainer}>
        <FlatList
          data={similarPosts}
          renderItem={renderSimilarPosts}
          keyExtractor={(item) => item.postId}
          horizontal={true}
          ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={5}
          windowSize={5}
          maxToRenderPerBatch={5}
          onEndReached={getSimilarPosts}
          onEndReachedThreshold={0.5}
          style={styles.similarPostsContainer}
          getItemLayout={(data, index) => ({
            length: SCREEN_WIDTH / 1.5 + 10,
            offset: SCREEN_WIDTH / 1.5 + 10 * index,
            index,
          })}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  similarPostsContainer: {
    // position: "absolute",
    // minHeight: SCREEN_HEIGHT / 4,
  },
  similarPostContainer: {
    borderColor: "white",
    borderWidth: 0.6,
    // minWidth: SCREEN_WIDTH / 3,
    // minHeight: SCREEN_HEIGHT / 8,
    width: SCREEN_WIDTH / 3,
    height: SCREEN_HEIGHT / 4,
  },
});

export default SimilarPostRow;
