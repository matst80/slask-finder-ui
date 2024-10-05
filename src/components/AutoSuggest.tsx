import { useEffect, useMemo, useState } from "react";
import { Item, KeyFacet, Suggestion } from "../types";
import { autoSuggestResponse } from "../api";
import { Search } from "lucide-react";
import { useQueryHelpers } from "../searchHooks";
import { makeImageUrl } from "../utils";

type MappedSuggestion = {
  match: string;
  hits: number;
  id: string;
  value: string;
};

const useAutoSuggest = () => {
  const [value, setValue] = useState<string | null>(null);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [facets, setFacets] = useState<KeyFacet[]>([]);
  useEffect(() => {
    if (value == null || value.length < 2) {
      return;
    }
    const { cancel, promise } = autoSuggestResponse(value);

    promise.then((d) => {
      if (!d.ok || d.body == null) {
        return;
      }
      let part = 0;
      const suggestions: Suggestion[] = [];
      const items: Item[] = [];
      let buffer = "";
      const reader = d.body.getReader();
      const decoder = new TextDecoder();
      const pump = async (): Promise<void> => {
        return reader?.read().then(async ({ done, value }) => {
          if (done) {
            return;
          }

          buffer += decoder.decode(value);
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          lines.forEach((line) => {
            if (line.length < 2) {
              part++;
              setItems(items);
              setResults(suggestions);
            } else {
              const item = JSON.parse(line);
              if (part === 0) {
                suggestions.push(item);
              } else if (part === 1) {
                items.push(item);
              } else {
                setFacets(item.fields ?? []);
              }
            }
          });

          return pump();
        });
      };
      pump();
    });
    return cancel;
  }, [value]);
  return { results, items, facets, setValue };
};

const MatchingFacets = ({ facets }: { facets: KeyFacet[] }) => {
  const toShow = useMemo(() => {
    const hasCategories = facets.some(
      (d) => d.categoryLevel != null && d.categoryLevel > 0
    );
    if (hasCategories) {
      return facets.filter(
        (d) => d.categoryLevel != null && d.categoryLevel > 0
      );
    }
    const hasType = facets.some((d) => d.type === "type");
    if (hasType) {
      return facets.filter((d) => d.type === "type");
    }
    return facets;
  }, [facets]);
  return (
    <div>
      {toShow.map((f) => (
        <div key={f.id} className="p-2">
          <h2 className="font-bold">{f.name}</h2>
          <ul className="flex gap-2 flex-wrap">
            {Object.entries(f.values).map(([value, hits]) => (
              <li
                key={value}
                className="bg-gray-500 rounded-full p-1 flex-grow-0"
              >
                {value} ({hits})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export const AutoSuggest = () => {
  const { setTerm } = useQueryHelpers();
  const { facets, items, results, setValue: setSuggestTerm } = useAutoSuggest();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value.length < 2) {
      return;
    }
    const timeout = setTimeout(() => {
      //setTerm(value);
      if (value.length < 2) {
        setSuggestTerm(null);
      } else {
        setSuggestTerm(value);
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, setSuggestTerm]);

  const applySuggestion = (value: string) => {
    setTerm(value);
    setOpen(false);
  };

  const showItems =
    open && (items.length > 0 || facets.length > 0 || results.length > 0);

  return (
    <>
      <div className="relative flex-1">
        <input
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          type="search"
          value={value}
          placeholder="Search..."
          onFocus={() => setOpen(true)}
          onBlur={() => applySuggestion(value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              applySuggestion(value);
            } else if (e.key === "ArrowRight" && results.length > 0) {
              setValue(results[0].match);
              applySuggestion(results[0].match);
            }
          }}
          onChange={(e) => setValue(e.target.value)}
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>
      {showItems && (
        <div className="absolute top-12 left-0 right-0 bg-white border border-gray-300 rounded-b-md shadow-lg max-h-[50vh] overflow-y-auto">
          <div>
            {results.map((r) => (
              <div key={r.match} className="p-2 hover:bg-gray-100">
                {r.match}
              </div>
            ))}
          </div>
          <MatchingFacets facets={facets} />
          <div>
            {items.map((i) => (
              <div key={i.id} className="p-2 hover:bg-gray-100 flex gap-2">
                <img
                  src={makeImageUrl(i.img)}
                  alt={i.title}
                  className="w-10 h-10"
                />
                {i.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
