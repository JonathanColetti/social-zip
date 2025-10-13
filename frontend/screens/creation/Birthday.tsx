import { View, Text, StyleSheet, TextInput, Platform } from "react-native";
import { Button } from "react-native-paper";
import React, { useContext, useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { shadowStyle } from "../../components/lib/Shadow";
import translator from "../../components/translations/translator";
import { BlurView } from "expo-blur";
import DatePicker from "react-native-date-picker";
import Container from "toastify-react-native";
import { GlobalContext } from "../../components/context/Global";

function Birthday({ navigation, route }: any) {
  const [notOldEnough, setNotOldEnough] = useState<boolean>(true);
  const [date, setDate] = useState<Date>(new Date());
  const {
    authState: { locale },
  } = useContext(GlobalContext);
  useEffect(() => {
    if (
      !route ||
      !route.params ||
      !route.params.id ||
      !route.params.authType ||
      !route.params.username
    ) {
      navigation.navigate("Login");
    }
  }, []);

  const checkDate = () => {
    const today = new Date();
    const diff = today.getTime() - date.getTime();
    const days = diff / (1000 * 3600 * 24);
    if (days > 5844) {
      setNotOldEnough(false);
    } else {
      setNotOldEnough(true);
    }
  };

  const changeDate = (date: Date) => {
    setDate(date);
    checkDate();
  };

  const uploadBirthday = async (): Promise<void> => {
    if (notOldEnough) return;
    if (!route.params || !route.params.id || !route.params.authType) {
      navigation.navigate("Login");
    }
    navigation.navigate("Name", {
      id: route.params.id,
      authType: route.params.authType,
      birthday: date.toISOString().substring(0, 10),
      username: route.params.username,
      rname: route.params.rname || route.params.username,
    });
  };
  return (
    <>
      <LinearGradient
        colors={["black", "white"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <BlurView tint="dark" intensity={70} style={StyleSheet.absoluteFill} />
        <Container theme={"dark"} position="top" />
        <View style={styles.birthdayCard}>
          <View style={styles.birthdayContent}>
            <View style={styles.birthdayHeader}>
              <Text style={styles.birthdayText}>
                {translator(locale).t("enterbirthday")}
              </Text>
            </View>
            <View style={styles.textInputContainer}>
              <DatePicker
                style={{
                  alignItems: "center",
                  alignContent: "center",
                  alignSelf: "center",
                }}
                mode="date"
                date={date}
                onDateChange={changeDate}
              />
            </View>
            <Text style={styles.errorText}>
              {notOldEnough ? translator(locale).t("youmustbe18orolder") : null}
            </Text>
            <Button
              buttonColor="black"
              disabled={notOldEnough}
              style={{ margin: 10 }}
              mode="contained"
              onPress={uploadBirthday}
            >
              {translator(locale).t("continue")}
            </Button>
          </View>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  birthdayCard: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 10,
    width: "90%",
    borderRadius: 40,
    ...shadowStyle(),
  },
  birthdayContent: {
    marginHorizontal: 40,
    marginTop: 20,
  },
  birthdayHeader: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
  },
  birthdayText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  textInputContainer: {
    maxWidth: "100%",
    alignContent: "center",
    marginTop: 15,
  },
  textInput: {
    height: 40,
    color: "black",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    flex: 1,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
  logoText: {
    position: "absolute",
    fontSize: Platform.OS === "web" ? 40 : 32,
    fontWeight: "bold",
    color: "black",
    top: 20,
    left: 20,
  },
});

export default Birthday;
