import { FlatList, View, Text, StyleSheet } from "react-native";
import { IPost } from "../../screens/Home";
import { useContext, useEffect, useState } from "react";
import { REALLY_LARGE_FONT, SCREEN_WIDTH } from "../lib/constants";
import translator from "../translations/translator";
import { renderPostCard } from "./PostRow";
import { GetHistoryPosts } from "../../api/graphql/Queries";
import { FormatQuery } from "../../api/graphql/FormatRequest";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { GlobalContext } from "../context/Global";

interface HistoryRowProps {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  authString: string | undefined;
}

function HistoryRow({ navigation, authString }: HistoryRowProps) {
  const [historyPosts, setHistoryPosts] = useState<IPost[]>([]);
  const [page, setPage] = useState<number>(0);
  const {
    authState: { locale },
  } = useContext(GlobalContext);
  useEffect(() => {
    if (historyPosts.length === 0) getMoreHistoryPosts();
  }, []);

  const getMoreHistoryPosts = async () => {
    const posts = await FormatQuery(
      GetHistoryPosts(),
      {
        pageNum: page,
      },
      authString
    );
    if (!posts || !posts.data || !posts.data.getHistoryPosts) {
      return;
    }
    const newPosts = posts.data.getHistoryPosts;
    setHistoryPosts([...historyPosts, ...newPosts]);
    setPage(page + 1);
  };

  return (
    <>
      <View style={styles.historyContainer}>
        <Text style={styles.headerText}>{translator(locale).t("history")}</Text>
        {historyPosts.length > 0 ? (
          <FlatList
            data={historyPosts}
            renderItem={(item) =>
              renderPostCard({ item: item.item, navigation })
            }
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={6}
            horizontal
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.postId}
            onEndReached={getMoreHistoryPosts}
            onEndReachedThreshold={0.3}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH + 10 / 3,
              offset: (SCREEN_WIDTH + 10 / 3) * index,
              index,
            })}
          />
        ) : (
          <Text style={{ color: "white", alignSelf: "center" }}>
            {translator(locale).t("noHistory")}
          </Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  historyContainer: {},
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

export default HistoryRow;
