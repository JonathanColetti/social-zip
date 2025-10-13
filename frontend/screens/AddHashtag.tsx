import { useContext, useState } from "react";
import {
  Text,
  Button,
  View,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import translator from "../components/translations/translator";
import { FormatQuery } from "../api/graphql/FormatRequest";
import { GetHastagsBySearch } from "../api/graphql/Queries";
import { NavigationHelpers, ParamListBase } from "@react-navigation/native";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { GlobalContext } from "../components/context/Global";

function AddHashtag({
  onAdd,
  navigation,
}: {
  onAdd: Function;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
}) {
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);
  const [value, setValue] = useState<string>("#");
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const {
    authState: { locale },
  } = useContext(GlobalContext);

  const onChangeSearchText = async (text: string) => {
    setLoading(true);
    if (text.length > 20) {
      setLoading(false);
      return;
    }
    if (text === "") {
      setItems([]);
      setLoading(false);
      return;
    }
    // replace uppercase letters with lowercase letters
    const formattedText = text.replace(/[A-Z]/g, (letter) =>
      letter.toLowerCase()
    );
    const hashtags = await FormatQuery(GetHastagsBySearch(), {
      search: formattedText,
      pageNum: 0,
    });
    if (!hashtags || !hashtags.data || !hashtags.data.getHashtagsBySearch) {
      setItems([{ value: text, label: text }]);
      setLoading(false);
      return;
    }
    const hashtagItems: { label: string; value: string }[] =
      hashtags.data.getHashtagsBySearch.map((hashtag: string) => {
        if (hashtag === formattedText) return;
        return {
          label: hashtag,
          value: hashtag,
        };
      });

    const uniqueValues: any = {};
    const uniqueHashtagItems = [];

    // O(N) time complexity
    for (const item of hashtagItems) {
      if (!uniqueValues[item.value]) {
        uniqueValues[item.value] = true;
        uniqueHashtagItems.push(item);
      }
    }
    setItems([
      { label: formattedText, value: formattedText },
      ...uniqueHashtagItems,
    ]);
    setLoading(false);
  };
  const goBack = () => {
    navigation.goBack();
  };
  const onSubmit = () => {
    setIsCreating(true);
    onAdd(value);
  };
  const onChangeValue = (value: string | null) => {
    if (value === null) return;
    setValue(value);
  };
  return (
    <>
      <Text style={styles.addAHashtagText}>
        {translator(locale).t("addAHashtag")}
      </Text>

      <DropDownPicker
        items={items}
        value={value}
        open={open}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        theme="DARK"
        searchable={true}
        maxHeight={150}
        searchPlaceholder={translator(locale).t("addAHashtag")}
        onChangeSearchText={onChangeSearchText}
        onChangeValue={onChangeValue}
        loading={loading}
        disableLocalSearch={true}
      />
      <View style={styles.buttonContaners}>
        <Button
          disabled={isCreating}
          onPress={onSubmit}
          title={translator(locale).t("createPost")}
        />
        <Button
          disabled={isCreating}
          onPress={goBack}
          color={"red"}
          title={translator(locale).t("goBack")}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  addAHashtagText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  containerButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  buttonContaners: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
});

export default AddHashtag;
