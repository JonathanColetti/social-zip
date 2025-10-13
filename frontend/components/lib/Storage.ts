// import secure storage from expo
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UseTheStorage = async (
  key: string,
  value: string | null = null
): Promise<string | null | void> => {
  if (Platform.OS === "web") {
    // no encryption for web
    if (value === null) {
      return await AsyncStorage.getItem(key);
    } else {
      return await AsyncStorage.setItem(key, value);
    }
  }
  // if value is null then get the value from secure storage
  if (value === null) {
    return await SecureStore.getItemAsync(key);
  }
  if (typeof value !== "string") return;
  // else set the value to secure storage
  return await SecureStore.setItemAsync(key, value);
};
