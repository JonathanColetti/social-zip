import {
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  View,
} from "react-native";
import { REALLY_LARGE_FONT, SCREEN_WIDTH } from "../lib/constants";
import translator from "../translations/translator";
import { FormatQuery } from "../../api/graphql/FormatRequest";
import { GetHashtags, GetPopularPosts } from "../../api/graphql/Queries";
import { useContext, useEffect, useState } from "react";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { GlobalContext } from "../context/Global";

const renderHashtags = ({
  item,
  navigation,
}: {
  item: string;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
}) => {
  const handlePress = () => {
    navigation.navigate("Home", { hashtag: item });
  };
  return (
    <>
      <TouchableOpacity onPress={handlePress} style={styles.container}>
        <Text style={styles.textStyle}>#{item}</Text>
      </TouchableOpacity>
    </>
  );
};

function HashtagRow({
  navigation,
  authString,
}: {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  authString: string | undefined;
}) {
  const [hashtagBtns, setHashtagBtns] = useState<string[]>([]);
  const [pageNum, setPageNum] = useState<number>(0);
  const {
    authState: { locale },
  } = useContext(GlobalContext);
  const getHashtags = async () => {
    const hashtags = await FormatQuery(
      GetHashtags(),
      {
        pageNum: pageNum,
      },
      authString
    );
    if (!hashtags || !hashtags.data || !hashtags.data.getHashtags) {
      return;
    }
    const newHashtags = hashtags.data.getHashtags.map(
      (hashtag: { hashtag: string }) => hashtag.hashtag
    );
    setHashtagBtns([...hashtagBtns, ...newHashtags]);
    setPageNum(pageNum + 1);
  };
  useEffect(() => {
    if (hashtagBtns.length === 0) getHashtags();
  }, []);
  return (
    <>
      <Text style={styles.headerText}>{translator(locale).t("hashtags")}</Text>
      {hashtagBtns.length > 0 ? (
        <>
          <FlatList
            data={hashtagBtns}
            renderItem={(item) =>
              renderHashtags({ item: item.item, navigation })
            }
            initialNumToRender={6}
            windowSize={6}
            maxToRenderPerBatch={6}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
            keyExtractor={(item) => item}
            onEndReached={getHashtags}
            onEndReachedThreshold={0.5}
            getItemLayout={(data, index) => ({
              length: 120,
              offset: 120 * index,
              index,
            })}
          />
        </>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "white",
    justifyContent: "center",
    alignSelf: "center",
    minWidth: SCREEN_WIDTH / 4,
    maxHeight: SCREEN_WIDTH / 10,
    borderRadius: 20,
    alignContent: "center",
    alignItems: "center",
  },
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
  textStyle: {
    color: "white",
    alignSelf: "center",
    padding: 20,
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 15,
  },
});

export { renderHashtags };
export default HashtagRow;
