import { Platform } from "react-native";

export const shadowStyle = (color: string = "black", height: number = 2) => {
    return Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: { width: 0, height: height },
        shadowOpacity: 0.9,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: `0 ${height}px 10px rgba(0,0,0,0.9)`,
      },
    });
};