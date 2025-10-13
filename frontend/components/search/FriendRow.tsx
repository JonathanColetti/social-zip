import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import translator from "../translations/translator";
import { useContext, useEffect, useState } from "react";
import { IFriendSuggestion } from "../../screens/Search";
import { REALLY_LARGE_FONT, SCREEN_WIDTH } from "../lib/constants";
import Image from "../lib/Image";
import { FormatQuery } from "../../api/graphql/FormatRequest";
import { GetProfileSuggestions } from "../../api/graphql/Queries";
import { GlobalContext } from "../context/Global";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
const renderFriendCards = ({
  item,
  navigation,
}: {
  item: IFriendSuggestion;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
}) => {
  const handlePress = () => {
    navigation.navigate("Profile", { username: item.username });
  };
  return (
    <>
      <TouchableOpacity onPress={handlePress} style={styles.container}>
        <Image
          source={
            item.profilePicture !== ""
              ? { uri: item.profilePicture }
              : require("../../assets/pexels-monstera-6373486.jpg")
          }
          style={styles.imageStyle}
        />
        <View style={{ height: 5 }} />
        <Text style={styles.nameStyle}>{item.rname}</Text>
        <Text style={styles.usernameStyle}>@{item.username}</Text>
      </TouchableOpacity>
    </>
  );
};

function FriendRow({
  navigation,
  authString,
}: {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  authString: string | undefined;
}) {
  const [friendSuggestions, setFriendSuggestions] = useState<
    IFriendSuggestion[]
  >([]);
  const [pageNum, setPageNum] = useState<number>(0);
  const {
    authState: { locale },
  } = useContext(GlobalContext);
  useEffect(() => {
    if (friendSuggestions.length === 0) getMoreFriends();
  }, []);
  const getMoreFriends = async () => {
    const friends = await FormatQuery(
      GetProfileSuggestions(),
      {
        pageNum: pageNum,
      },
      authString
    );
    if (!friends || !friends.data || !friends.data.getFriendSuggestions) {
      return;
    }
    setFriendSuggestions([
      ...friendSuggestions,
      ...friends.data.getFriendSuggestions,
    ]);
    setPageNum(pageNum + 1);
  };

  return (
    <>
      <View style={{ marginTop: "4%" }}>
        <Text style={styles.headerText}>
          {translator(locale).t("friendSuggestions")}
        </Text>
        {friendSuggestions.length > 0 ? (
          <FlatList
            data={friendSuggestions}
            renderItem={(item) =>
              renderFriendCards({ item: item.item, navigation })
            }
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            keyExtractor={(item) => item.username}
            onEndReached={getMoreFriends}
            onEndReachedThreshold={0.5}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH + 10 / 3,
              offset: (SCREEN_WIDTH + 10 / 3) * index,
              index,
            })}
          />
        ) : (
          <>
            <Text style={styles.usernameStyle}>
              {translator(locale).t("noFriendSuggestion")}
            </Text>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH / 3,
    height: SCREEN_WIDTH / 3,
    borderColor: "white",
    borderRadius: 20,
    borderWidth: 0.6,
  },
  imageStyle: {
    width: "50%",
    height: "50%",
    alignSelf: "center",
    marginTop: 10,
    borderRadius: 100,
  },
  nameStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  usernameStyle: {
    color: "white",
    fontWeight: "300",
    textAlign: "center",
    alignSelf: "center",
    fontSize: 12,
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
});

export { renderFriendCards };
export default FriendRow;
