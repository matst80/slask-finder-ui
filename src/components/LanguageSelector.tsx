import { getLocale, setCookie } from "../utils";

const regions = ["sv-SE", "sv-FI", "en-US", "en-GB"];
const regionNamesInEnglish = new Intl.DisplayNames(["en"], {
  type: "language",
});

export const LanguageSelector = () => {
  const locale = getLocale();
  return (
    <select
      onChange={(e) => {
        setCookie("sflocale", e.target.value, 365);
        window.location.reload();
      }}
      value={locale}
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
