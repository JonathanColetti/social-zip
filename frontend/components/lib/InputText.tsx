import { useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { IconButton } from "react-native-paper";

interface IInputText {
  isDarkTheme: boolean;
  onPress: (text: string) => void;
  btmHeight: number;
  placeHolderText: string;
}

function InputText(props: IInputText) {
  const { isDarkTheme, onPress, btmHeight } = props;
  const [text, setText] = useState<string>("");
  const styles = style(isDarkTheme, btmHeight);
  const onTextChange = (text: string) => setText(text);
  return (
    <>
      <TextInput
        placeholderTextColor={isDarkTheme ? "white" : "black"}
        placeholder={props.placeHolderText}
        onChangeText={onTextChange}
        multiline
        value={text}
        style={styles.textInputStyle}
      />
      <IconButton
        onPress={() => onPress(text)}
        icon={"send"}
        iconColor={isDarkTheme ? "white" : "black"}
        style={styles.iconButtonContainer}
      />
    </>
  );
}

const style = (isDarkTheme: boolean, btmHeight: number) =>
  StyleSheet.create({
    textInputStyle: {
      backgroundColor: isDarkTheme ? "black" : "white",
      color: isDarkTheme ? "white" : "black",
      maxWidth: "100%",
      height: 50,
      marginBottom: btmHeight,
      borderColor: isDarkTheme ? "white" : "black",
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 5,
    },
    iconButtonContainer: {
      position: "absolute",
      right: 10,
      bottom: btmHeight,
    },
  });

export default InputText;
