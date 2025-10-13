import { FlatList, Text, View, StyleSheet } from "react-native";
import translator from "../translations/translator";
import { useContext, useEffect, useState } from "react";
import { renderHashtags } from "./HashtagRow";
import { SearchRowProps } from "./SearchUsers";
import { FormatQuery } from "../../api/graphql/FormatRequest";
import { GetHastagsBySearch } from "../../api/graphql/Queries";
import { REALLY_LARGE_FONT } from "../lib/constants";
import { GlobalContext } from "../context/Global";

function SearchHashtags({
  navigation,
  authString,
  searchTerm,
}: SearchRowProps) {
  const [searchedHashtags, setSearchedHashtags] = useState<string[]>([]);
  const [hashtagSearchPageNum, setHashtagSearchPageNum] = useState<number>(0);
  const {
    authState: { locale },
  } = useContext(GlobalContext);

  useEffect(() => {
    getMoreSearchedHashtags(false);
  }, [searchTerm]);

  const getMoreSearchedHashtags = async (append: boolean = true) => {
    const hashtags = await FormatQuery<any>(GetHastagsBySearch(), {
      query: searchTerm,
      pageNum: hashtagSearchPageNum,
    }).catch((err) => {
      err;
    });
    if (!hashtags || !hashtags.data || !hashtags.data.getHashtagsBySearch) {
      //   Toast.error("Failed to connect to server");
      return;
    }
    if (hashtags.data.getHashtagsBySearch.length <= 0) return;

    if (!append) {
      setSearchedHashtags(hashtags.data.getHashtagsBySearch);
      setHashtagSearchPageNum(hashtagSearchPageNum + 1);
    } else {
      setSearchedHashtags([
        ...searchedHashtags,
        ...hashtags.data.getHashtagsBySearch,
      ]);
      setHashtagSearchPageNum(hashtagSearchPageNum + 1);
    }
    return;
  };
  return (
    <>
      <Text style={styles.headerText}>{translator(locale).t("hashtags")}</Text>
      <View style={{ height: 20 }} />
      {searchedHashtags.length <= 0 ? (
        <>
          <View>
            <Text style={{ color: "white", alignSelf: "center" }}>
              {translator(locale).t("noHashtagsFound")}
            </Text>
          </View>
        </>
      ) : (
        <>
          <FlatList
            data={searchedHashtags}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            renderItem={({ item }) => renderHashtags({ item, navigation })}
            initialNumToRender={6}
            windowSize={6}
            maxToRenderPerBatch={6}
            keyExtractor={(item) => item + "s"}
            getItemLayout={(data, index) => ({
              length: 110,
              offset: 110 * index,
              index,
            })}
            onEndReached={() => getMoreSearchedHashtags()}
            onEndReachedThreshold={0.5}
          />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: REALLY_LARGE_FONT,
    fontWeight: "bold",
    color: "white",
    alignSelf: "center",
  },
});

export default SearchHashtags;
