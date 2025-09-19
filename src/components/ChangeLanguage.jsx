

import { useTranslation } from "react-i18next";

function ChangeLanguage() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div>
      <h1>{t("welcome")}</h1>
      <button onClick={() => changeLanguage("en")}>English</button>
      <button onClick={() => changeLanguage("vi")}>Tiếng Việt</button>
    </div>
  );
}