import { useEffect, useState } from "react";
import { useSearchContext } from "../SearchContext";
import { Suggestion } from "../types";
import { autoSuggest } from "../api";

export const AutoSuggest = () => {
  const ctx = useSearchContext();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  useEffect(() => {
    if (term.length < 3) {
      return;
    }
    autoSuggest(term).then((data: Suggestion[]) => {
      setResults(data);
    });
  }, [term]);
  return (
    <>
      <input
        type="search"
        value={term}
        list="suggestions"
        onBlur={() => ctx.setTerm(term)}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            ctx.setTerm(term);
            ctx.setPage(0);
          }
        }}
        onChange={(e) => setTerm(e.target.value)}
      />
      <datalist id="suggestions">
        {results.map(({ hits, match }, idx) => (
          <option key={`word-${idx}`} value={match}>
            {match}: {hits}
          </option>
        ))}
      </datalist>
    </>
  );
};
