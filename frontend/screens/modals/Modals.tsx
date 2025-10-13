import { BlurView } from "expo-blur";
import { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Platform,
} from "react-native";
import {
  BACKEND_URL,
  CAROUSEL_FILTER_COLOR,
  CAROUSEL_FILTER_COLOR_ANDRIOD,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "../../components/lib/constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import translator from "../../components/translations/translator";
import { GlobalContext } from "../../components/context/Global";

interface ModalsProps {
  title: string;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onEnter: (text: string) => void;
}

interface ReportModalProps {
  title: string;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onEnter: (values: string[]) => void;
}

function Modals({ title, setModalOpen, onEnter }: ModalsProps) {
  const [text, setText] = useState<string>("");
  const onSubmit = () => {
    onEnter(text);
  };
  const insets = useSafeAreaInsets();
  return (
    <>
      <View
        style={[
          styles.container,
          { marginTop: insets.top, marginBottom: insets.bottom },
        ]}
      >
        <View style={styles.subContainer}>
          <BlurView tint="dark" style={styles.blurView}>
            <Text style={styles.headerText}>{title}</Text>

            <TextInput
              placeholder={title}
              value={text}
              onChangeText={setText}
              style={styles.textInput}
              placeholderTextColor={"white"}
              multiline
            />
            <View style={styles.buttonContainer}>
              <Button
                disabled={text === ""}
                onPress={onSubmit}
                title="Enter"
                color="#007AFF"
              />
              <Button
                title="Close"
                color="red"
                onPress={() => setModalOpen(false)}
              />
            </View>
          </BlurView>
        </View>
      </View>
    </>
  );
}

/*

*/

function ReportModal({ title, setModalOpen, onEnter }: ReportModalProps) {
  const [values, setValues] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {
    authState: { locale },
  } = useContext(GlobalContext);
  const onSubmit = () => {
    onEnter(values);
  };
  const insets = useSafeAreaInsets();
  return (
    <>
      <View
        style={[
          styles.container,
          { marginTop: insets.top, marginBottom: insets.bottom },
        ]}
      >
        <View style={styles.subContainer}>
          <BlurView tint="dark" style={styles.blurView}>
            <Text style={styles.headerText}>{title}</Text>
            <DropDownPicker
              items={[
                { label: translator(locale).t("spam"), value: "spam" },
                {
                  label: translator(locale).t("inappropriate"),
                  value: "inappropriate",
                },
                { label: translator(locale).t("copy"), value: "dcma" },
                { label: translator(locale).t("other"), value: "other" },
              ]}
              value={values}
              setItems={setValues}
              multiple={true}
              placeholder={translator(locale).t("select")}
              theme="DARK"
              open={isOpen}
              setOpen={setIsOpen}
              setValue={setValues}
            />
            <View style={styles.buttonContainer}>
              <Button
                disabled={values.length === 0}
                onPress={onSubmit}
                title={translator(locale).t("submit")}
                color="#007AFF"
              />
              <Button
                title={translator(locale).t("close")}
                color="red"
                onPress={() => setModalOpen(false)}
              />
            </View>
          </BlurView>
        </View>
      </View>
    </>
  );
}

function AskForLinkModal({
  setModalOpen,
  onEnter,
}: {
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onEnter: (text: string) => void;
}) {
  const [link, setLink] = useState<string>("");
  const [text, setText] = useState<string>("");
  const {
    authState: { locale },
  } = useContext(GlobalContext);
  const onSubmit = () => {
    onEnter(`${link} ${text}`);
  };
  const insets = useSafeAreaInsets();
  return (
    <>
      <View
        style={[
          styles.container,
          { marginTop: insets.top, marginBottom: insets.bottom },
        ]}
      >
        <View style={styles.subContainer}>
          <BlurView tint="dark" style={styles.blurView}>
            <Text style={styles.headerText}>
              {translator(locale).t("link")}
            </Text>

            <TextInput
              placeholder={translator(locale).t("linkInfo")}
              value={link}
              onChangeText={setLink}
              style={styles.textInput}
              placeholderTextColor={"white"}
              multiline
            />
            <Text style={styles.headerText}>
              {translator(locale).t("text")}
            </Text>
            <TextInput
              placeholder={translator(locale).t("textInfo")}
              value={text}
              onChangeText={setText}
              style={styles.textInput}
              placeholderTextColor={"white"}
              multiline
            />
            <View style={styles.buttonContainer}>
              <Button
                disabled={text === ""}
                onPress={onSubmit}
                title={translator(locale).t("add")}
                color="#007AFF"
              />
              <Button
                title={translator(locale).t("close")}
                color="red"
                onPress={() => setModalOpen(false)}
              />
            </View>
          </BlurView>
        </View>
      </View>
    </>
  );
}

function ReportUserModal({ title, setModalOpen, onEnter }: ReportModalProps) {
  const [values, setValues] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {
    authState: { locale },
  } = useContext(GlobalContext);
  const onSubmit = async () => {
    // onEnter(text);
    onEnter(values);
  };
  const insets = useSafeAreaInsets();
  return (
    <>
      <View
        style={[
          styles.container,
          { marginTop: insets.top, marginBottom: insets.bottom },
        ]}
      >
        <View style={styles.subContainer}>
          <BlurView tint="dark" style={styles.blurView}>
            <Text style={styles.headerText}>{title}</Text>
            <DropDownPicker
              items={[
                { label: translator(locale).t("spam"), value: "spam" },
                {
                  label: translator(locale).t("inappropriate"),
                  value: "inappropriate",
                },
                { label: translator(locale).t("other"), value: "other" },
              ]}
              value={values}
              setItems={setValues}
              multiple={true}
              // renderListItem={(props) => {
              //   ;
              //   return <></>;
              // }}
              placeholder={translator(locale).t("select")}
              theme="DARK"
              open={isOpen}
              setOpen={setIsOpen}
              setValue={setValues}
            />
            <View style={styles.buttonContainer}>
              <Button
                disabled={values.length === 0}
                onPress={onSubmit}
                title={translator(locale).t("submit")}
                color="#007AFF"
              />
              <Button
                title={translator(locale).t("close")}
                color="red"
                onPress={() => setModalOpen(false)}
              />
            </View>
          </BlurView>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(50,50,50,0.5)",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  subContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  blurView: {
    flex: 1,
    maxHeight: "50%",
    borderRadius: 40,
    maxWidth: "80%",
    minWidth: "80%",
    padding: 20,
    overflow: "hidden",
    alignItems: "center",
  },
  textInput: {
    color: "white",
    backgroundColor: "transparent",
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    margin: 5,
    maxHeight: "50%",
    minWidth: "80%",
  },
  buttonContainer: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
});

export { ReportModal, ReportUserModal, AskForLinkModal };
export default Modals;
