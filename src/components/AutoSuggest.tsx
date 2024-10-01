import { useEffect, useMemo, useState } from "react";
import { useSearchContext } from "../SearchContext";
import { Suggestion } from "../types";
import { autoSuggest } from "../api";
import { Search } from "lucide-react";

type MappedSuggestion = {
  match: string;
  hits: number;
  id: string;
  value: string;
};

export const AutoSuggest = () => {
  const { term, setTerm, setPage } = useSearchContext();

  const [value, setValue] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTerm(value);
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [value]);

  const [results, setResults] = useState<MappedSuggestion[]>([]);
  useEffect(() => {
    if (value.length < 2) {
      return;
    }

    autoSuggest(value).then((data: Suggestion[]) => {
      const parts = value.split(" ");
      if (parts.length > 0) {
        parts.pop();
      }
      if (value.endsWith(" ")) {
        return;
      }
      setResults(
        data
          .sort((a, b) => b.hits - a.hits)
          .map(({ match, hits }, idx) => ({
            match,
            hits,
            id: `suggestion-${idx}`,
            value: [...parts, match].join(" "),
          }))
          .slice(0, Math.min(10, data.length)),
      );
    });
  }, [value]);

  const applySuggestion = (value: string) => {
    setTerm(value);
    setPage(0);
  };

  return (
    <div className="relative flex-1">
      <input
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        type="search"
        value={value}
        placeholder="Search..."
        list="suggestions"
        onBlur={() => applySuggestion(value)}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            applySuggestion(value);
          } else if (e.key === "ArrowRight" && results.length > 0) {
            setValue(results[0].value);
            applySuggestion(results[0].value);
          }
        }}
        onChange={(e) => setValue(e.target.value)}
      />
      <Search
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        size={20}
      />

      <datalist id="suggestions">
        {results.map(({ match, value }, idx) => (
          <option key={`wrd-${idx}`} value={value}>
            {match}
          </option>
        ))}
      </datalist>
    </div>
  );
};
