import { useEffect, useMemo, useState } from "react";
import { Item, KeyFacet, Suggestion } from "../types";
import { autoSuggestResponse, getRawData } from "../api";
import { Search } from "lucide-react";
import { queryToHash, useQueryHelpers } from "../searchHooks";
import { makeImageUrl } from "../utils";
import { useDetails } from "../appState";

// type MappedSuggestion = {
//   match: string;
//   hits: number;
//   id: string;
//   value: string;
// };

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
              setResults(suggestions.sort((a, b) => b.hits - a.hits));
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

const MatchingFacets = ({
  facets,
  query,
}: {
  facets: KeyFacet[];
  query: string;
}) => {
  const toShow = useMemo(() => {
    const hasType = facets.some((d) => d.type === "type");
    if (hasType) {
      return facets.filter((d) => d.type === "type");
    }
    const hasCategories = facets.some(
      (d) => d.categoryLevel != null && d.categoryLevel > 0
    );
    if (hasCategories) {
      return facets.filter(
        (d) =>
          (d.categoryLevel != null && d.categoryLevel > 0) || d.type === "type"
      );
    }

    return facets;
  }, [facets]);
  return (
    <div>
      {toShow.map((f) => (
        <div className="p-2">
          <h2 className="font-bold">{f.name}:</h2>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(f.values)
              .sort((a, b) => b[1] - a[1])
              .slice(undefined, 5)
              .map(([value, hits]) => (
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                  onClick={() => {
                    globalThis.location.hash = queryToHash({
                      string: [{ id: f.id, value }],
                      query,
                      stock: [],
                      page: 0,
                    });
                  }}
                >
                  {value}
                  <span className="ml-2 inline-flex items-center justify-center px-1 h-4 rounded-full bg-blue-200 text-blue-500">
                    {hits}
                  </span>
                </span>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const AutoSuggest = () => {
  const {
    setTerm,
    query: { query },
  } = useQueryHelpers();
  const [_, setDetails] = useDetails();
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

  useEffect(() => {
    if (query != null && query.length > 0) {
      setValue(query);
    }
  }, [query]);

  const applySuggestion = (value: string) => {
    setTerm(value);
  };

  const showItems =
    open && (items.length > 0 || facets.length > 0 || results.length > 0);

  useEffect(() => {
    const close = () => setOpen(false);
    globalThis.document.addEventListener("click", close);
    return () => globalThis.document.removeEventListener("click", close);
  }, []);

  const loadItem = (id: string) => () => {
    getRawData(id).then(setDetails);
  };
  console.log({ open, showItems });
  return (
    <>
      <div
        className="relative flex-1"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
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
              const query = [...results[0].other, results[0].match]
                .filter((d) => d != null && d.length > 0)
                .join(" ");
              setValue(query);
              applySuggestion(query);
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
        <div
          className="absolute block top-12 left-0 right-0 bg-white border border-gray-300 rounded-b-md shadow-xl max-h-[50vh] overflow-y-auto divide-y space-y-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            {results.slice(undefined, 6).map((r) => (
              <button
                key={r.match}
                className="p-2 hover:bg-gray-100"
                onClick={() => {
                  const query = [...r.other, r.match].join(" ");
                  setValue(query);
                  //setTerm(query);
                }}
              >
                {r.match} ({r.hits})
              </button>
            ))}
          </div>
          <MatchingFacets facets={facets} query={value} />
          <div className="lg:grid grid-cols-2">
            {items.map((i) => (
              <button
                key={i.id}
                onClick={loadItem(i.id)}
                className="p-2 hover:bg-gray-100 flex gap-2 cursor-pointer"
              >
                <img
                  src={makeImageUrl(i.img)}
                  alt={i.title}
                  className="w-10 h-10"
                />
                {i.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
