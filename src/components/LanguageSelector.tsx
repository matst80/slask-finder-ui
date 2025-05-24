"use client";
import { useState } from "react";
import { useCookieAcceptance } from "../CookieConsent";
import { getLocale, setCookie } from "../utils";

const regions = ["sv-SE", "sv-FI", "en-US", "en-GB"];
const regionNamesInEnglish = new Intl.DisplayNames(["en"], {
  type: "language",
});

export const LanguageSelector = () => {
  const { accepted } = useCookieAcceptance();
  const [locale] = useState<string | null>(() => getLocale());

  if (accepted === "none" || accepted === null) {
    return null;
  }
  return (
    <select
      onChange={(e) => {
        setCookie("sflocale", e.target.value, 365);
        globalThis.location?.reload();
      }}
      value={locale ?? "sv-SE"}
      className="border border-gray-50 rounded-md p-2 appearance-none"
    >
      {regions.map((item) => (
        <option key={item} value={item}>
          {regionNamesInEnglish.of(item)}
        </option>
      ))}
    </select>
  );
};
