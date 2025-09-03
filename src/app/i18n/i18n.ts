// i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
import en from "./locales/en.json";
import de from "./locales/de.json";

// Define resources type
export type TranslationResources = {
  en: { translation: typeof en };
  de: { translation: typeof de };
};

const resources: TranslationResources = {
  en: { translation: en },
  de: { translation: de },
};

const LANGUAGE_KEY = "app_language";

// Function to set and persist language
export const changeLanguage = async (lng: keyof TranslationResources) => {
  try {
    localStorage.setItem(LANGUAGE_KEY, lng);
    await i18n.changeLanguage(lng);
  } catch (error) {
    console.error("Error saving language preference:", error);
  }
};

// Function to get stored language
export const getStoredLanguage = (): keyof TranslationResources | null => {
  try {
    return localStorage.getItem(LANGUAGE_KEY) as keyof TranslationResources;
  } catch (error) {
    console.error("Error reading language preference:", error);
    return null;
  }
};

// Function to get browser language
export const getBrowserLanguage = (): keyof TranslationResources => {
  const browserLang = navigator.language.split("-")[0];
  return (browserLang === "de" ? "de" : "en") as keyof TranslationResources;
};

// Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: getStoredLanguage() || getBrowserLanguage(),
  fallbackLng: "de",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  detection: {
    order: ["localStorage", "navigator"],
    caches: ["localStorage"],
  },
});

// Initialize language from storage or browser settings
export const initI18n = async () => {
  try {
    const savedLanguage = getStoredLanguage();
    const browserLanguage = getBrowserLanguage();

    const languageToUse = savedLanguage || browserLanguage;
    await i18n.changeLanguage(languageToUse);
  } catch (error) {
    console.error("Error initializing i18n:", error);
    i18n.changeLanguage("en");
  }
};

// Listen for language changes to update localStorage
i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(LANGUAGE_KEY, lng);
  } catch (error) {
    console.error("Error saving language preference:", error);
  }
});

// Export the configured i18n instance
export default i18n;
