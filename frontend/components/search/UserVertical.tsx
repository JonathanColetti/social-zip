import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Image from "../lib/Image";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
function UserVertical({
  username,
  name,
  profilePicture,
  isVerified,
  navigation,
}: {
  username: string;
  name: string;
  profilePicture: string;
  isVerified: boolean;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
}) {
  const handlePress = () => {
    navigation.navigate("Profile", { username: username });
  };
  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        style={{
          flexDirection: "row",
          margin: 20,
          borderColor: "white",
          borderWidth: 0.5,
          padding: 10,
          borderRadius: 10,
        }}
      >
        <Image
          style={styles.imgStyle}
          source={
            profilePicture === ""
              ? require("../../assets/pexels-monstera-6373486.jpg")
              : { uri: profilePicture }
          }
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={{ color: "white", fontWeight: "bold" }}>{name}</Text>
          <Text style={{ color: "white" }}>@{username}</Text>
        </View>
        {isVerified && <></>}
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  imgStyle: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

export default UserVertical;
