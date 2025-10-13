import { useContext, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import FontAwesome5IconButton from "react-native-vector-icons/FontAwesome5";
import HueColorSlider from "../lib/ColorSlider";
import tinycolor from "tinycolor2";
import { Button } from "react-native-paper";
import translator from "../translations/translator";
import { GlobalContext } from "../context/Global";

export interface ProfileAccentProps {
  sheetId: string;
  payload: {
    accent: string;
    setValue: (value: number) => void;
  };
}

export default function ProfileAccent({
  sheetId,
  payload,
}: ProfileAccentProps) {
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const [accent, setAccent] = useState<string>(payload.accent);
  const [oldAccent, setOldAccent] = useState<number>(
    tinycolor(payload.accent).toHsv().h
  );
  const {
    authState: { locale },
  } = useContext(GlobalContext);
  const cancelBtn = () => {
    if (!actionSheetRef.current) {
      return;
    }
    payload.setValue(oldAccent);
    actionSheetRef.current.hide({
      payload: {
        accent: false,
      },
    });
  };
  const saveBtn = async () => {
    if (!actionSheetRef.current) {
      return;
    }
    actionSheetRef.current.hide({
      payload: {
        accent: accent,
      },
    });
  };
  const setValue = (value: any) => {
    setAccent(value);
    payload.setValue(value);
  };

  return (
    <>
      <ActionSheet
        id={sheetId}
        ref={actionSheetRef}
        containerStyle={{
          width: "100%",
          height: "20%",
          maxHeight: "10%",
          backgroundColor: "rgba(50, 50, 50, 0.9)",
        }}
        indicatorStyle={{
          width: 100,
        }}
        backgroundInteractionEnabled={false}
        gestureEnabled={false}
      >
        <View
          style={{
            width: "100%",
            height: "80%",

            justifyContent: "center",
            paddingBottom: 50,
          }}
        >
          <View style={[styles.buttonRow]}>
            <View style={{ flexDirection: "column", alignItems: "center" }}>
              <FontAwesome5IconButton name="image" size={24} />
              <Text>{translator(locale).t("profileAccent")}</Text>
            </View>
          </View>
          <Text style={styles.sliderText}>
            {translator(locale).t("accentColor")}
          </Text>
          <HueColorSlider
            hue={tinycolor(payload.accent).toHsv().h}
            setValue={setValue}
          />
          <View style={styles.actionBtnContainer}>
            <Button
              icon={"check"}
              textColor="black"
              buttonColor="white"
              style={{ flex: 1, marginRight: 10 }}
              onPress={saveBtn}
            >
              {translator(locale).t("save")}
            </Button>
            <Button
              icon={"cancel"}
              textColor="white"
              buttonColor="red"
              style={{ flex: 1, marginLeft: 10 }}
              onPress={cancelBtn}
            >
              {translator(locale).t("cancel")}
            </Button>
          </View>
        </View>
      </ActionSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(50, 50, 50, 0.9)",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    // flex: 1
  },
  sliderText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  actionBtnContainer: {
    flexDirection: "row",
    marginTop: 20,
    width: "70%",
    justifyContent: "space-evenly",
    alignSelf: "center",
  },
});
