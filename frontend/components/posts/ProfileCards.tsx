import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import Image from "../lib/Image";
import { UnixTimeStampToShortForm } from "../lib/Utils";
import { PROFILE_POST_PICTURE_SIZE } from "../lib/constants";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
interface ProfileViewProps {
  username: string;
  profilePicture: string;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  hashtag?: string;
  btmHeight: number;
  timestamp: string;
  title: string;
  isDarkTheme: boolean;
  locale: string | null;
}

function ProfileCardSnapView(props: ProfileViewProps) {
  const {
    username,
    profilePicture,
    navigation,
    hashtag,
    btmHeight,
    timestamp,
    title,
    locale,
  } = props;
  const navigateToProfile = () => {
    if (navigation === undefined) return;
    navigation.navigate("Profile", { username: username });
  };
  const navigateToHashtag = () => {
    if (navigation === undefined || hashtag === undefined) return;
    navigation.navigate("Home", { hashtag: hashtag });
  };
  return (
    <>
      <TouchableOpacity
        onPress={navigateToHashtag}
        style={{
          backgroundColor: "rgba(50,50,50,0.5)",
          position: "absolute",
          bottom: btmHeight + 10 + PROFILE_POST_PICTURE_SIZE + 30,
          marginLeft: 20,
          padding: 5,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white" }}>#{hashtag}</Text>
      </TouchableOpacity>
      <View style={[styles.textContainer, { bottom: btmHeight + 10 }]}>
        <View
          style={{
            justifyContent: "center",
            position: "absolute",
            right: 5,
            top: 5,
            flexDirection: "row",
          }}
        >
          <Text style={[styles.dateText]}>
            {UnixTimeStampToShortForm(timestamp, locale)}
          </Text>
        </View>
        {/* want to add a card stack to show all posters if there is more than one  */}
        <TouchableOpacity onPress={navigateToProfile}>
          <Image
            source={{ uri: profilePicture }}
            style={styles.profilePicture}
          />
        </TouchableOpacity>
        <View>
          <TouchableOpacity
            onPress={navigateToProfile}
            style={{ flexDirection: "row", justifyContent: "flex-start" }}
          >
            <Text style={styles.nameText}>{username}</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>{title}</Text>
        </View>
      </View>
    </>
  );
}

function ProfileHomeCard(props: ProfileViewProps) {
  const {
    username,
    profilePicture,
    navigation,
    hashtag,
    btmHeight,
    title,
    timestamp,
  } = props;
  const navigateToProfile = () => {
    if (navigation === undefined) return;
    navigation.navigate("Profile", { username: username });
  };
  const navigateToHashtag = () => {
    if (navigation === undefined || hashtag === undefined) return;
    navigation.navigate("Home", { hashtag: hashtag });
  };
  const textColor = props.isDarkTheme ? "white" : "black";

  return (
    <>
      <View>
        <View style={{ flexDirection: "row" }}>
          <Image
            source={{ uri: profilePicture }}
            style={styles.profilePicture}
          />
          <View>
            <Text style={[styles.nameText, { color: textColor }]}>Name</Text>
            <Text style={[styles.dateText, { color: textColor }]}>
              Username
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {},
  dateText: {
    fontSize: 14,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignSelf: "center",
    justifyContent: "center",
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  textContainer: {},
});

export { ProfileCardSnapView, ProfileHomeCard };
