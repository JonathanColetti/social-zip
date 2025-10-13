import { useContext, useEffect, useState } from "react";
import InputText from "../components/lib/InputText";
import { GlobalContext } from "../components/context/Global";
import {
  TextInput,
  View,
  StyleSheet,
  useWindowDimensions,
  FlatList,
  ListRenderItem,
} from "react-native";
import translator from "../components/translations/translator";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, IconButton } from "react-native-paper";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { ITiniPost } from "./ViewPost";
import { FormatQuery } from "../api/graphql/FormatRequest";
import {
  GetHastagsBySearch,
  GetPostsBySearch,
  GetUsersBySearch,
} from "../api/graphql/Queries";
import ParsePosts from "../components/posts/ParsePosts";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../components/lib/constants";
import Container, { Toast } from "expo-react-native-toastify";
import UserVertical from "../components/search/UserVertical";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";

const UserSearchRow = ({
  searchTerm,
  navigation,
}: {
  searchTerm: string;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [pageNum, setPageNum] = useState<number>(0);
  const {
    authState: { locale },
  } = useContext(GlobalContext);
  useEffect(() => {
    fetchMore();
  }, []);
  const fetchMore = async () => {
    const fetchedUsers = await FormatQuery(GetUsersBySearch(), {
      query: searchTerm,
      pageNum: pageNum,
    });
    if (
      !fetchedUsers ||
      !fetchedUsers.data ||
      !fetchedUsers.data.getUsersBySearch
    ) {
      Toast.error(translator(locale).t("pleasetryagain"));
      return;
    }
    if (fetchedUsers.data.getUsersBySearch.length <= 0) return;
    setUsers([...users, ...fetchedUsers.data.getUsersBySearch]);
    setPageNum(pageNum + 1);
  };
  const renderUsers = ({ item, index }: { item: any; index: number }) => {
    return (
      <UserVertical
        isVerified={item.isVerified}
        profilePicture={item.profilePicture}
        username={item.username}
        name={item.rname}
        navigation={undefined as any}
      />
    );
  };
  return (
    <>
      <FlatList
        data={users}
        renderItem={renderUsers}
        keyExtractor={(item) => item.username}
        onEndReached={fetchMore}
        windowSize={14}
        initialNumToRender={14}
        maxToRenderPerBatch={14}

        // getItemLayout={(data, index) => ({
        //   length: SCREEN_HEIGHT / 4,
        //   offset: (SCREEN_HEIGHT / 4) * index,
        //   index,
        // })}
      />
    </>
  );
};

const PostSearchRow = ({
  searchTerm,
  navigation,
}: {
  searchTerm: string;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
}) => {
  const [posts, setPosts] = useState<ITiniPost[]>([]);
  const [pageNum, setPageNum] = useState<number>(0);
  const {
    authState: { locale },
  } = useContext(GlobalContext);
  useEffect(() => {
    fetchMore();
  }, []);
  const fetchMore = async () => {
    const searchedPosts = await FormatQuery(GetPostsBySearch(), {
      query: searchTerm,
      pageNum: pageNum,
    });
    if (
      !searchedPosts ||
      !searchedPosts.data ||
      !searchedPosts.data.getPostsBySearch
    ) {
      Toast.error(translator(locale).t("pleasetryagain"));
      return;
    }
    if (searchedPosts.data.getPostsBySearch.length <= 0) return;
    setPosts([...posts, ...searchedPosts.data.getPostsBySearch]);
    setPageNum(pageNum + 1);
  };
  const parsePosts = ({ item, index }: { item: ITiniPost; index: number }) => {
    return (
      <>
        <ParsePosts
          uri={item.uri}
          id={item.postId}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT / 4}
          setContentFilter={undefined}
          isScrollable={false}
          navigation={navigation}
        />
      </>
    );
  };
  return (
    <>
      <FlatList
        data={posts}
        renderItem={parsePosts}
        keyExtractor={(item) => item.postId}
        onEndReached={fetchMore}
        windowSize={6}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT + 10 / 4,
          offset: (SCREEN_HEIGHT + 10 / 4) * index,
          index,
        })}
      />
    </>
  );
};

const HashtagSearchRow = ({
  searchTerm,
  navigation,
}: {
  searchTerm: string;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
}) => {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [pageNum, setPageNum] = useState<number>(0);
  const {
    authState: { locale },
  } = useContext(GlobalContext);
  useEffect(() => {
    fetchMore();
  }, []);
  const fetchMore = async () => {
    const fetchedHashtags = await FormatQuery(GetHastagsBySearch(), {
      query: searchTerm,
      pageNum: pageNum,
    });
    if (
      !fetchedHashtags ||
      !fetchedHashtags.data ||
      !fetchedHashtags.data.getHashtagsBySearch
    ) {
      Toast.error(translator(locale).t("pleasetryagain"));
      return;
    }
    if (fetchedHashtags.data.getHashtagsBySearch.length <= 0) return;
    setHashtags([...hashtags, ...fetchedHashtags.data.getHashtagsBySearch]);
    setPageNum(pageNum + 1);
  };
  const onHashtagPress = (hashtag: string) => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Home", params: { hashtag: hashtag } }],
    });
    return;
  };
  const renderHashtags = ({ item, index }: { item: string; index: number }) => {
    return (
      <>
        <View>
          <Button
            icon={"pound"}
            textColor="white"
            style={{
              borderColor: "white",
              borderWidth: 0.5,
              maxWidth: 400,
            }}
            mode={"text"}
            onPress={() => onHashtagPress(item)}
          >
            {item}
          </Button>
        </View>
      </>
    );
  };
  return (
    <>
      <FlatList
        data={hashtags}
        renderItem={renderHashtags}
        keyExtractor={(item) => item}
        onEndReached={fetchMore}
        windowSize={14}
        ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
        initialNumToRender={14}
        maxToRenderPerBatch={14}
        getItemLayout={(data, index) => ({
          length: 420,
          offset: 420 * index,
          index,
        })}
      />
    </>
  );
};

const RenderTabBar = (props: any) => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: "white" }}
    style={{ backgroundColor: "black" }}
  />
);

function Searched({ navigation, route }: { navigation: any; route: any }) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [index, setIndex] = useState<number>(0);
  const {
    authState: { locale },
  } = useContext(GlobalContext);
  const [routes] = useState<{ key: string; title: string }[]>([
    { key: "first", title: translator(locale).t("posts") },
    { key: "second", title: translator(locale).t("users") },
    { key: "third", title: translator(locale).t("hashtags") },
  ]);
  const insets = useSafeAreaInsets();
  const layout = useWindowDimensions();

  useEffect(() => {
    if (!route.params && !route.params.term) {
      navigation.goBack();
    } else {
      setSearchTerm(route.params.term);
    }
  }, []);
  const {
    authState: { isDarkTheme, btmHeight },
  } = useContext(GlobalContext);
  const onSearchChange = (text: string) => {
    setSearchTerm(text);
  };
  const RenderScene = SceneMap<{
    searchTerm: string;
    navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  }>({
    first: () => (
      <PostSearchRow navigation={navigation} searchTerm={route.params.term} />
    ),
    second: () => (
      <UserSearchRow navigation={navigation} searchTerm={route.params.term} />
    ),
    third: () => (
      <HashtagSearchRow
        navigation={navigation}
        searchTerm={route.params.term}
      />
    ),
  });
  return (
    <>
      <View style={styles.container}>
        <Container theme={"dark"} position="top" />
        <View style={{ height: insets.top }} />
        <View style={{ flexDirection: "row" }}>
          <IconButton
            icon="arrow-left"
            iconColor="white"
            onPress={() => navigation.goBack()}
            style={{ flex: 1 }}
          />
          <TextInput
            returnKeyLabel="Search"
            onChangeText={onSearchChange}
            numberOfLines={1}
            value={searchTerm}
            style={styles.searchInput}
            placeholderTextColor={isDarkTheme ? "white" : "black"}
            placeholder={translator(locale).t("searchSomething")}
          />
        </View>
        <TabView
          navigationState={{ index, routes }}
          renderScene={(props) => <RenderScene {...props} />}
          onIndexChange={setIndex}
          renderTabBar={RenderTabBar}
          initialLayout={{ width: layout.width }}
        />
        <View
          style={[styles.bottomPad, { height: insets.bottom + btmHeight }]}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    flex: 1,
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
  bottomPad: {
    backgroundColor: "transparent",
    zIndex: 1,
  },
});

export default Searched;
