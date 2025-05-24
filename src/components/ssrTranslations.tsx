import { PathInto } from "../lib/types";
import { extractFromObject, replaceMustacheKeys } from "../lib/utils";
import { Translations } from "../translations/translations";

export const ssrTranslations = (translations: Translations) => {
  return (
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
  };
};
