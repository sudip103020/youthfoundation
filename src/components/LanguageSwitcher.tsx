import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language: "bn" | "en") => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <button
        type="button"
        className={`btn btn-sm ${
          i18n.language === "bn"
            ? "btn-primary"
            : "btn-outline-primary"
        }`}
        onClick={() => changeLanguage("bn")}
      >
        বাংলা
      </button>

      <button
        type="button"
        className={`btn btn-sm ${
          i18n.language === "en"
            ? "btn-primary"
            : "btn-outline-primary"
        }`}
        onClick={() => changeLanguage("en")}
      >
        English
      </button>
    </div>
  );
};

export default LanguageSwitcher;