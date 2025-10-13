import { useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { GlobalContext } from "../components/context/Global";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UnixTimeStampToShortForm } from "../components/lib/Utils";
import { FormatQuery } from "../api/graphql/FormatRequest";
import { GetNotifications } from "../api/graphql/Queries";
import Image from "../components/lib/Image";
import translator from "../components/translations/translator";
import Container, { Toast } from "toastify-react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import * as Notifications from "expo-notifications";

export interface ISmallPost {
  postId: string;
  uri: string;
  hashtag?: string;
}

export interface INotifications {
  username: string;
  profilePicture: string;
  message: string;
  postId: string | null;
  comment: string | null;
  stimestamp: string;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function NotificationScreen({ navigation, route }: any) {
  const [notifs, setNotifs] = useState<INotifications[]>([]);
  const [pageNum, setPageNum] = useState<number>(0);
  const {
    authState: { id, authType, locale },
  } = useContext(GlobalContext);
  useEffect(() => {
    if (notifs.length === 0) renderMoreNotifs();
  }, []);
  const renderMoreNotifs = async () => {
    const authString = id && authType ? `${id}:${authType}` : undefined;
    const notifsResult = await FormatQuery(
      GetNotifications(),
      {
        lastSortKey: notifs[notifs.length - 1]?.username || "",
      },
      authString
    );
    if (
      !notifsResult ||
      !notifsResult.data ||
      !notifsResult.data.getNotifications
    ) {
      Toast.error(translator(locale).translate("pleasetryagain"));
      return;
    }
    if (notifsResult.data.getNotifications.length === 0) return;
    setNotifs([...notifs, ...notifsResult.data.getNotifications]);
    setPageNum(pageNum + 1);
  };

  const insets = useSafeAreaInsets();
  const renderNotification = ({ item }: { item: INotifications }) => {
    const navigateToProfile = () => {
      navigation.navigate("Profile", { username: item.username });
    };
    return (
      <View style={[styles.itemContainer, { borderColor: "white" }]}>
        <TouchableOpacity
          onPress={navigateToProfile}
          style={{ flexDirection: "row", alignItems: "center", padding: 10 }}
        >
          <Container theme={"dark"} position="top" />
          <View>
            <View style={{ flexDirection: "row" }}>
              <Image
                source={
                  item.profilePicture !== ""
                    ? { uri: item.profilePicture }
                    : require("../assets/pexels-monstera-6373486.jpg")
                }
                style={styles.profilePictureImage}
              />
              <View>
                <View>
                  <Text style={{ color: "white", marginLeft: 10 }}>
                    @{item.username}
                  </Text>
                </View>
                <Text style={{ color: "gray", marginLeft: 10 }}>
                  {UnixTimeStampToShortForm(item.stimestamp, locale)}
                </Text>
              </View>
            </View>
            <View style={{ padding: 10 }}>
              <Text style={{ color: "white" }}>{item.message}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  const onPressSettings = () => {
    navigation.navigate("Settings");
  };
  return (
    <>
      <View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: "black" }]}
      />
      <FontAwesome5Icon
        onPress={onPressSettings}
        color={"white"}
        name="cog"
        size={24}
        style={{
          top: insets.top,
          zIndex: 999,
          position: "absolute",
          right: 10,
        }}
      />
      <View
        style={[
          styles.container,
          { backgroundColor: "black", paddingTop: insets.top },
        ]}
      >
        <View
          style={[
            styles.headerContainer,
            { borderColor: "white", paddingBottom: 10 },
          ]}
        >
          <Text
            style={[styles.headerText, { color: "white", fontWeight: "bold" }]}
          >
            {translator(locale).t("notifications")}
          </Text>
        </View>

        {notifs && notifs.length === 0 ? (
          <>
            <View style={styles.emptyContainer}>
              <Text style={styles.headerText}>
                {translator(locale).t("noNotifications")}
              </Text>
            </View>
          </>
        ) : (
          <>
            <FlatList
              style={{ marginTop: 19 }}
              ItemSeparatorComponent={() => <View style={{ margin: 10 }} />}
              data={notifs}
              renderItem={renderNotification}
              keyExtractor={(item) => item.stimestamp}
              onEndReachedThreshold={0.5}
              onEndReached={renderMoreNotifs}
              getItemLayout={(data, index) => {
                return {
                  length: 100 + 10,
                  offset: 100 + 10 * index,
                  index,
                };
              }}
              initialNumToRender={8}
              windowSize={8}
              maxToRenderPerBatch={8}
            />
          </>
        )}
      </View>
      <View
        style={[
          {
            position: "absolute",
            alignContent: "center",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      ></View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    alignSelf: "center",
    textAlign: "center",
    fontSize: 20,
  },
  itemContainer: {
    borderWidth: 1,
    borderRadius: 10,
  },
  profilePictureImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 5,
  },
  emptyContainer: {
    position: "absolute",
    alignContent: "center",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  noNotificationsStyle: {
    textAlign: "center",
    fontSize: 24,
    textAlignVertical: "center",
    color: "white",
  },
});

export default NotificationScreen;
