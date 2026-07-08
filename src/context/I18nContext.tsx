"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "@/locales/en.json";
import pt from "@/locales/pt.json";

type Language = "en" | "pt";

interface I18nContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const dictionaries: Record<Language, any> = {
  en,
  pt
};

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt");

  useEffect(() => {
    // Load from local storage on mount
    const saved = localStorage.getItem("app_lang") as Language;
    if (saved && (saved === "en" || saved === "pt")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value = dictionaries[language];
    for (const k of keys) {
      if (value === undefined) break;
      value = value[k];
    }
    return value !== undefined ? value : key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
