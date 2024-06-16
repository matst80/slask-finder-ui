import { useEffect, useState } from "react";

type Suggestion = {
  match: string;
  hits: number;
};

export const AutoSuggest = () => {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  useEffect(() => {
    if (term.length < 3) {
      return;
    }
    fetch(`http://localhost:8080/suggest?q=${term}`)
      .then((res) => res.json())
      .then((data: Suggestion[]) => {
        setResults(data);
      });
  }, [term]);
  return (
    <>
      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <ul>
        {results.map(({ hits, match: word }, idx) => (
          <li key={`word-${idx}`}>
            <strong>{word}</strong> <span>{hits}</span>
          </li>
        ))}
      </ul>
    </>
  );
};
