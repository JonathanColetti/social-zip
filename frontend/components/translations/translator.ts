import I18n from "react-native-i18n";
import * as Localize from "expo-localization";
import translations from "./translations";
import { UseTheStorage } from "../lib/Storage";

function translator(locale: string | null): any {
  let loca = locale ? locale : Localize.locale;
  UseTheStorage("locale").then((slocale) => {
    if (slocale) {
      loca = slocale;
    }
  });

  const translator = I18n;
  translator.fallbacks = true;
  translator.locale = loca;
  translator.translations = translations;
  return translator;
}

export default translator;
