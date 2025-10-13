import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../components/context/Global";
import { FormatMutation, FormatQuery } from "../api/graphql/FormatRequest";
import { GetBlockedUsers } from "../api/graphql/Queries";
import { FlatList, View, Text, StyleSheet } from "react-native";
import { REALLY_LARGE_FONT, SCREEN_HEIGHT } from "../components/lib/constants";
import { IconButton } from "react-native-paper";
import { BlockUser } from "../api/graphql/Mutations";
import Container, { Toast } from "toastify-react-native";
import translator from "../components/translations/translator";
import { useSafeAreaInsets } from "react-native-safe-area-context";
function BlockedUsers() {
  const {
    authState: { id, authType, btmHeight, locale },
  } = useContext(GlobalContext);
  const insets = useSafeAreaInsets();
  const [blocked, setBlocked] = useState<string[]>([]);
  const [pageNum, setPageNum] = useState<number>(0);
  useEffect(() => {
    getBlockedUsers();
  }, []);
  const getBlockedUsers = async () => {
    if (!id || !authType) {
      Toast.error(translator(locale).t("pleasetryagain"));
      return;
    }
    const blockedUsers = await FormatQuery(
      GetBlockedUsers(),
      {
        pageNum: pageNum,
      },
      `${id}:${authType}`,
      undefined
    );
    if (
      !blockedUsers ||
      !blockedUsers.data ||
      !blockedUsers.data.getBlockedUsers
    ) {
      return;
    }
    setBlocked(blockedUsers.data.getBlockedUsers);
    setPageNum(pageNum + 1);
  };
  const unBlockUser = async (username: string) => {
    if (!id || !authType) {
      Toast.error(translator(locale).t("pleasetryagain"));
      return;
    }
    const didUnBlock = await FormatMutation(
      BlockUser(),
      {
        username: username,
        unblock: true,
      },
      `${id}:${authType}`
    );
    if (!didUnBlock || !didUnBlock.data || !didUnBlock.data.blockUser) {
      Toast.error(translator(locale).t("pleasetryagain"));
      return;
    }
    Toast.success(translator(locale).t("success"));
    setBlocked(blocked.filter((user) => user !== username));
  };
  return (
    <>
      <View style={[styles.container]}>
        <Container theme="dark" position="top" />

        <Text
          style={[
            styles.headerText,
            { marginTop: insets.top, marginBottom: insets.bottom },
          ]}
        >
          {translator(locale).t("blockedUsers")}
        </Text>
        <FlatList
          data={blocked}
          renderItem={({ item }) => (
            <View style={styles.blockedUserRow}>
              <Text style={styles.regularText}>@{item}</Text>
              <IconButton
                icon={"close"}
                size={30}
                onPress={() => unBlockUser(item)}
              />
            </View>
          )}
          onEndReached={getBlockedUsers}
          keyExtractor={(item) => item}
          style={{
            height: SCREEN_HEIGHT - btmHeight - SCREEN_HEIGHT / 2.3,
            zIndex: 99999999,
            backgroundColor: "black",
          }}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "black",
    height: SCREEN_HEIGHT,
  },
  headerText: {
    color: "white",
    fontSize: REALLY_LARGE_FONT,
    fontWeight: "bold",
    textAlign: "center",
  },
  regularText: { color: "white", fontWeight: "600" },
  blockedUserRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default BlockedUsers;
