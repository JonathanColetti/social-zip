import { useContext, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { GlobalContext } from "../context/Global";
import translator from "../translations/translator";
import translations from "../translations/translations";
import { Button } from "react-native-paper";
import { UseTheStorage } from "./Storage";

function LanguageExpandable() {
  const {
    authState: { locale },
    authDispatch,
  } = useContext(GlobalContext);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const onPressLanguage = async (language: string) => {
    await UseTheStorage("locale", language);
    authDispatch({ type: "SET_LOCALE", payload: language });
    setIsExpanded(false);
  };
  return (
    <>
      <View style={{ margin: "4%" }}>
        <Text
          style={styles.textHeader}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          {translator(locale).t("language")}
        </Text>
        {isExpanded && (
          <ScrollView showsHorizontalScrollIndicator={false} horizontal>
            {Object.keys(translations).map((key: string) => {
              return (
                <Button
                  style={{
                    borderWidth: 1,
                    borderColor: "white",
                    marginHorizontal: 5,
                  }}
                  buttonColor={
                    locale && locale.includes(key) ? "white" : "black"
                  }
                  textColor={locale && locale.includes(key) ? "black" : "white"}
                  onPress={() => onPressLanguage(key)}
                  key={key}
                >
                  {key}
                </Button>
              );
            })}
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  expandedContainer: {},
  textHeader: {
    color: "white",
    fontSize: 24,
    textAlign: "center",
    fontWeight: "500",
  },
  textSmall: {
    color: "white",
  },
});

export default LanguageExpandable;
