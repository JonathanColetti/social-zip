import { View, Text, FlatList, StyleSheet } from "react-native";
import { REALLY_LARGE_FONT, SCREEN_WIDTH } from "../lib/constants";
import { renderPostCard } from "./PostRow";
import { SearchRowProps } from "./SearchUsers";
import { useContext, useEffect, useState } from "react";
import translator from "../translations/translator";
import { FormatQuery } from "../../api/graphql/FormatRequest";
import { GetPostsBySearch } from "../../api/graphql/Queries";
import { IMiniPost } from "../../screens/Search";
import { GlobalContext } from "../context/Global";

function SearchPosts({ navigation, searchTerm, authString }: SearchRowProps) {
  const [searchedPosts, setSearchedPosts] = useState<IMiniPost[]>([]);
  const [searchPageNum, setSearchPageNum] = useState<number>(0);
  const {
    authState: { locale },
  } = useContext(GlobalContext);

  useEffect(() => {
    setSearchedPosts([]);
    setSearchPageNum(0);
    getMoreSearchedPosts();
  }, [searchTerm]);

  const getMoreSearchedPosts = async () => {
    const nsearchedPosts = await FormatQuery<any>(
      GetPostsBySearch(),
      {
        query: searchTerm,
        pageNum: searchPageNum,
      },
      authString
    ).catch((err) => {});
    if (
      !nsearchedPosts ||
      !nsearchedPosts.data ||
      !nsearchedPosts.data.getPostsBySearch
    ) {
      //   Toast.error("Failed to connect to server");
      return;
    }
    setSearchedPosts([
      ...searchedPosts,
      ...nsearchedPosts.data.getPostsBySearch,
    ]);
    setSearchPageNum(searchPageNum + 1);
    return;
  };
  return (
    <>
      <Text style={styles.headerText}>{translator(locale).t("posts")}</Text>
      <View style={{ height: 20 }} />

      {searchedPosts.length <= 0 ? (
        <>
          <View>
            <Text style={{ color: "white", alignSelf: "center" }}>
              {translator(locale).t("noPostsFound")}
            </Text>
          </View>
        </>
      ) : (
        <>
          <FlatList
            data={searchedPosts}
            renderItem={(item) =>
              renderPostCard({ item: item.item, navigation })
            }
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={6}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            horizontal
            keyExtractor={(item) => item.postId + "s"}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH / 3 + 10,
              offset: SCREEN_WIDTH / 3 + 10 * index,
              index,
            })}
            onEndReached={getMoreSearchedPosts}
          />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerText: {
    color: "white",
    fontSize: REALLY_LARGE_FONT,
    fontWeight: "bold",
    alignSelf: "center",
  },
});

export default SearchPosts;
