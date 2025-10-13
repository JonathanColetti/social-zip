import { FlatList, Text, View, StyleSheet } from "react-native";
import { renderFriendCards } from "./FriendRow";
import { REALLY_LARGE_FONT, SCREEN_WIDTH } from "../lib/constants";
import translator from "../translations/translator";
import { useContext, useEffect, useState } from "react";
import { FormatQuery } from "../../api/graphql/FormatRequest";
import { GetPostsBySearch, GetUsersBySearch } from "../../api/graphql/Queries";
import { IFriendSuggestion } from "../../screens/Search";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { GlobalContext } from "../context/Global";

export interface SearchRowProps {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  searchTerm: string;
  authString: string | undefined;
}

function SearchUsers({ navigation, searchTerm, authString }: SearchRowProps) {
  const [searchedUsers, setSearchedUsers] = useState<IFriendSuggestion[]>([]);
  const [searchPageNum, setSearchPageNum] = useState<number>(0);
  const {
    authState: { locale },
  } = useContext(GlobalContext);

  useEffect(() => {
    getMoreSearchUsers(false);
  }, [searchTerm]);

  const getMoreSearchUsers = async (append: boolean = true) => {
    const users = await FormatQuery<any>(
      GetUsersBySearch(),
      {
        pageNum: searchPageNum,
        query: searchTerm,
      },
      authString,
      undefined
    ).catch((err) => {});
    if (!users || !users.data || !users.data.getUsersBySearch) {
      // Toast.error("Failed to connect to server");
      return;
    }
    if (!append) {
      setSearchedUsers(users.data.getUsersBySearch);
      setSearchPageNum(1);
      return;
    }
    setSearchedUsers([...searchedUsers, ...users.data.getUsersBySearch]);
    setSearchPageNum(searchPageNum + 1);
    return;
  };
  return (
    <>
      <Text style={styles.headerText}>{translator(locale).t("users")}</Text>
      <View style={{ height: 20 }} />

      {searchedUsers.length <= 0 ? (
        <>
          <View>
            <Text style={{ color: "white", alignSelf: "center" }}>
              {translator(locale).t("noUsersFound")}
            </Text>
          </View>
        </>
      ) : (
        <>
          <FlatList
            data={searchedUsers}
            renderItem={(item) =>
              renderFriendCards({ item: item.item, navigation })
            }
            initialNumToRender={6}
            windowSize={6}
            maxToRenderPerBatch={6}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            keyExtractor={(item) => item.username}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH / 3 + 10,
              offset: (SCREEN_WIDTH / 3 + 10) * index,
              index,
            })}
            onEndReached={() => getMoreSearchUsers(true)}
            onEndReachedThreshold={0.5}
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

export default SearchUsers;
