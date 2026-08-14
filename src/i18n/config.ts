import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en";
import bn from "./bn";

const savedLanguage =
  localStorage.getItem("language") === "bn" ? "bn" : "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
      bn,
    },

    lng: savedLanguage,
    fallbackLng: "en",

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;