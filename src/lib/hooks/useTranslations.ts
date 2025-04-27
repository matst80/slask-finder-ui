import { useCallback, useContext } from "react";
import { translationContext } from "./translationContext";
import { PathInto } from "../types";
import { extractFromObject, replaceMustacheKeys } from "../utils";
import { Translations } from "../../translations/translations";

export const useTranslations = () => {
  const translations = useContext(translationContext);
  if (translations === null) {
    throw new Error(
      "useTranslations must be used within a TranslationProvider"
    );
  }
  return useCallback(
    (
      key: PathInto<Translations>,
      replacementValues?: Record<string, unknown>,
      defaultValue?: string
    ): string => {
      if (typeof key !== "string") {
        return defaultValue ?? key;
      }
      const value = extractFromObject(translations, key.split("."));
      return value
        ? replaceMustacheKeys(value, replacementValues)
        : defaultValue || key;
    },
    [translations]
  );
};
