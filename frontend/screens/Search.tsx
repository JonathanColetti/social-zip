import { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  LARGE_BUTTON_SIZE,
  REALLY_LARGE_FONT,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "../components/lib/constants";
import { GlobalContext } from "../components/context/Global";
import { shadowStyle } from "../components/lib/Shadow";

import Container, { Toast } from "toastify-react-native";
import translator from "../components/translations/translator";
import HashtagRow from "../components/search/HashtagRow";
import PostRow from "../components/search/PostRow";
import FriendRow from "../components/search/FriendRow";
import HistoryRow from "../components/search/HistoryRow";
import LikedRow from "../components/search/LikedRow";
import SearchUsers from "../components/search/SearchUsers";
import SearchPosts from "../components/search/SearchPosts";
import SearchHashtags from "../components/search/SearchHashtags";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";

export interface IMiniPost {
  postId: string;
  uri: string;
}

export interface IFriendSuggestion {
  username: string;
  profilePicture: string;
  rname: string;
  isVerified: boolean;
}

function Search({
  navigation,
  route,
}: {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  route: any;
}) {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const {
    authState: { btmHeight, isDarkTheme, id, authType, locale },
  } = useContext(GlobalContext);
  const authString = id && authType ? `${id}:${authType}` : undefined;
  const onFocus = () => {
    if (!isFocused) {
      setIsFocused(true);
    }
  };
  const onUnFocus = () => {
    if (searchTerm !== "") {
      navigation.reset({
        index: 0,
        routes: [{ name: "Searched", params: { term: searchTerm } }],
      });
      return;
    } else setIsFocused(false);
  };
  const onSearchChange = (text: string) => {
    // check if return key was pressed

    if (text === "\n") {
      setIsFocused(true);
      return;
    } else if (text === "") {
      setIsFocused(false);
    }
    if (!isFocused) setIsFocused(true);
    setSearchTerm(text);
  };
  const insets = useSafeAreaInsets();
  const onRefresh = () => {};
  const onKeyPressGetEnd = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    // check if key is enter or search
    // console.log(e.nativeEvent.key, "ketttt");
    // if (e.nativeEvent.key === "Enter") {
    //   setIsFocused(true);
    // }
  };
  return (
    <>
      <ScrollView
        style={[
          styles.container,
          {
            backgroundColor: isDarkTheme ? "black" : "white",
          },
        ]}
        refreshControl={
          <RefreshControl
            tintColor={isDarkTheme ? "white" : "black"}
            refreshing={false}
            onRefresh={onRefresh}
          />
        }
      >
        <Container theme={"dark"} position="top" />
        <View style={[styles.textInputContainer, { marginTop: insets.top }]}>
          <TextInput
            onBlur={onUnFocus}
            onFocus={onFocus}
            returnKeyType="search"
            onKeyPress={onKeyPressGetEnd}
            onChangeText={onSearchChange}
            value={searchTerm}
            style={styles.searchInput}
            placeholderTextColor={isDarkTheme ? "white" : "black"}
            placeholder={translator(locale).t("searchSomething")}
          />
        </View>
        {/* Row of filters  */}

        {!isFocused && (
          <>
            <LikedRow authString={authString} navigation={navigation} />
            <HistoryRow authString={authString} navigation={navigation} />
            <FriendRow authString={authString} navigation={navigation} />
            <PostRow authString={authString} navigation={navigation} />
            <HashtagRow authString={authString} navigation={navigation} />
          </>
        )}
        {isFocused && (
          <>
            {/* Users */}
            <KeyboardAvoidingView>
              <View style={{ height: 20 }} />
              <SearchUsers
                authString={authString}
                navigation={navigation}
                searchTerm={searchTerm}
              />
              <View style={{ height: 40 }} />
              <SearchPosts
                authString={authString}
                navigation={navigation}
                searchTerm={searchTerm}
              />
              <View style={{ height: 40 }} />
              <SearchHashtags
                authString={authString}
                navigation={navigation}
                searchTerm={searchTerm}
              />
              <View style={{ height: 40 }} />
            </KeyboardAvoidingView>
          </>
        )}
        <View style={styles.paddingBottom} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textInputContainer: {},
  contentFilterContainer: {
    marginTop: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    width: "80%",
    borderColor: "white",
    borderWidth: 1,
    alignSelf: "center",
    color: "white",
    height: 40,
    borderRadius: 10,
    textAlign: "center",
  },
  blurViewContainer: {},
  searchIcon: {},
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
  itemContainer: {
    justifyContent: "flex-end",
    borderRadius: 5,
    padding: 10,
    height: 150,
    marginTop: 10,
  },
  itemName: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  itemCode: {
    fontWeight: "600",
    fontSize: 12,
    color: "#fff",
  },
  sectionHeader: {
    flex: 1,
    fontSize: REALLY_LARGE_FONT,
    fontWeight: "bold",
    alignItems: "center",
    color: "white",
    textAlign: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "white",
    width: "80%",
    alignSelf: "center",
    ...shadowStyle(),
  },
  historyContainer: {
    marginTop: "4%",
  },
  paddingBottom: {
    height: SCREEN_HEIGHT / 6,
  },
});

export default Search;
