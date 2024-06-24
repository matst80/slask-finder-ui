import { useEffect, useState } from "react";
import { useSearchContext } from "../SearchContext";
import { Suggestion } from "../types";
import { autoSuggest } from "../api";

type MappedSuggestion = {
  match: string;
  hits: number;
  id: string;
  value: string;
};

export const AutoSuggest = () => {
  const ctx = useSearchContext();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<MappedSuggestion[]>([]);
  useEffect(() => {
    if (term.length < 2) {
      return;
    }

    autoSuggest(term).then((data: Suggestion[]) => {
      const parts = term.split(" ");
      if (parts.length > 0) {
        parts.pop();
      }
      if (term.endsWith(" ")) {
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
          .slice(0, Math.min(10, data.length))
      );
    });
  }, [term]);

  const applySuggestion = (value: string) => {
    ctx.setTerm(value);
    ctx.setPage(0);
  };
  return (
    <>
      <input
        className="suggest-input"
        type="search"
        value={term}
        placeholder="Search..."
        list="suggestions"
        onBlur={() => ctx.setTerm(term)}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            applySuggestion(term);
          } else if (e.key === "ArrowRight" && results.length > 0) {
            setTerm(results[0].value);
            applySuggestion(results[0].value);
          }
        }}
        onChange={(e) => setTerm(e.target.value)}
      />

      <datalist id="suggestions">
        {results.map(({ match, value }, idx) => (
          <option key={`word-${idx}`} value={value}>
            {match}
          </option>
        ))}
      </datalist>
    </>
  );
};
