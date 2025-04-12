import { useEffect, useMemo, useState } from "react";
import {
  Facet,
  isKeyFacet,
  Item,
  ItemsQuery,
  KeyFacet,
  NumberFacet,
  Suggestion,
} from "../lib/types";
import {
  autoSuggestResponse,
  getPopularQueries,
  getTriggerWords,
} from "../lib/datalayer/api";
import { Search } from "lucide-react";

import { byPriority, isDefined, makeImageUrl } from "../utils";
import { Link } from "react-router-dom";
import { useQuery } from "../lib/hooks/QueryProvider";
import { StockIndicator } from "./ResultItem";
import { trackSuggest } from "../lib/datalayer/beacons";
import useSWR from "swr";
import fuzzysort from "fuzzysort";
import { useFacetMap } from "../hooks/searchHooks";

type SuggestField = { name: string; id: number; value: string[] };
const MIN_SCORE = 0.9;
type SuggestQuery = {
  term: string;
  fields: SuggestField[];
};

type FlatFacetValue = {
  value: string;
  id: number;
  valueType: string;
  name: string;
  prio?: number;
  description: string;
  categoryLevel?: number;
};

const useAutoSuggest = () => {
  const { data: facetData } = useFacetMap();
  //const { data } = useSWR("trigger-words", () => getTriggerWords());
  const [value, setValue] = useState<string | null>(null);
  const [popularQueries, setPopularQueries] = useState<SuggestQuery[] | null>();
  const [results, setResults] = useState<Suggestion[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [smartQuery, setSmartQuery] = useState<ItemsQuery | null>(null);
  const [possibleTriggers, setPossibleTriggers] = useState<
    | {
        word: string;
        result: Fuzzysort.KeysResults<FlatFacetValue>;
      }[]
    | null
  >(null);
  const [facets, setFacets] = useState<KeyFacet[]>([]);
  useEffect(() => {
    if (facetData == null) {
      return;
    }
    getPopularQueries(value ?? "").then((d) => {
      setPopularQueries(
        Object.entries(d).map(([term, data]) => {
          const fields = Object.entries(data.keyFacets)
            .map(([fieldId, { values }]) => {
              const facet = facetData[fieldId];
              if (facet == null) {
                return;
              }
              return {
                name: facet.name,
                id: Number(fieldId),
                value: Object.keys(values),
              };
            })
            .filter(isDefined);

          return { term, fields };
        })
      );
    });
  }, [value, facetData]);

  const parts = useMemo(() => {
    if (value == null) {
      return new Set<string>();
    }
    const words = value.toLocaleLowerCase().split(" ");
    const lastWord = words.pop();
    if (lastWord == null) {
      return new Set<string>();
    }
    return new Set(words.concat(lastWord));
  }, [value]);

  useEffect(() => {
    if (facets == null || facets.length === 0) {
      //setSmartQuery(null);
      //setPossibleTriggers(null);
      return;
    }
    const wordResults = Array.from(parts).map((word) => {
      const result = fuzzysort.go(
        word,
        facets
          .filter((d) => d.valueType != null)
          .flatMap(({ result: { values }, selected: _, ...rest }) =>
            Object.keys(values ?? {}).map(
              (value): FlatFacetValue => ({ ...rest, value })
            )
          ) ?? [],
        {
          keys: ["value"],
          limit: 10,
          threshold: -100,
        }
      );

      //console.log("reslt total", word, result.total);
      return { word, result };
    });

    const words = new Set(parts);

    const newQuery: ItemsQuery = {
      string: [],
      range: [],
    };

    wordResults.forEach(({ word, result }) => {
      const [best] = result;
      if (best != null && best.score > MIN_SCORE) {
        words.delete(word);
        newQuery.string = [
          ...(newQuery.string?.filter((d) => d.id !== best.obj.id) ?? []),
          {
            id: best.obj.id,
            value: [
              ...(newQuery.string?.find((d) => d.id === best.obj.id)?.value ??
                []),
              best.obj.value,
            ],
          },
        ];
      }
    });

    newQuery.query = parts.size > 0 ? Array.from(parts).join(" ") : undefined;
    const validTriggers = wordResults.filter(({ result }) => result.length > 0);
    if (validTriggers.length === 0) {
      setSmartQuery(null);
      setPossibleTriggers(null);
      return;
    } else {
      setSmartQuery(newQuery);
      setPossibleTriggers(validTriggers);
    }
    //return [wordResults, newQuery];
  }, [parts, facets]);

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
      const facetsBuffer: KeyFacet[] = [];
      let buffer = "";
      const reader = d.body.getReader();
      const decoder = new TextDecoder();
      const pump = async (): Promise<void> => {
        return reader?.read().then(async ({ done, value: dataChunk }) => {
          if (done) {
            setResults(suggestions.sort((a, b) => b.hits - a.hits));

            setItems(items);

            setFacets(facetsBuffer.filter(isKeyFacet));
            trackSuggest({
              value,
              items: items.length,
              suggestions: suggestions.length,
            });
            return;
          }

          buffer += decoder.decode(dataChunk);
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          lines.forEach((line) => {
            if (line.length < 2) {
              if (part === 0) {
                setResults(suggestions.sort((a, b) => b.hits - a.hits));
              } else if (part === 1) {
                setItems(items);
              } else {
                setFacets(facetsBuffer.filter(isKeyFacet));
              }
              part++;
            } else {
              const item = JSON.parse(line);
              if (part === 0) {
                suggestions.push(item);
              } else if (part === 1) {
                items.push(item);
              } else {
                console.log("pushing facet", item);
                facetsBuffer.push(item);
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
  return {
    results,
    items,
    facets,
    setValue,
    popularQueries,
    value,
    possibleTriggers,
    smartQuery,
  };
};

const MatchingFacets = ({
  facets,
  query,
  close,
}: {
  facets: KeyFacet[];
  query: string;
  close: () => void;
}) => {
  const { setQuery } = useQuery();
  const toShow = useMemo(() => {
    return facets.filter((d) => d.valueType != null).sort(byPriority);
  }, [facets]);
  console.log("toShow", toShow, facets);
  return (
    <div>
      {toShow.map((f) => (
        <div className="p-2">
          <h2 className="font-bold">{f.name}:</h2>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(f.result.values)
              .sort((a, b) => b[1] - a[1])
              .slice(undefined, 10)
              .map(([value, hits]) => (
                <button
                  key={value}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                  onClick={() => {
                    console.log("set query", f.id, value, close);
                    setQuery({
                      string: [{ id: f.id, value: [value] }],
                      query:
                        query != null &&
                        value.toLowerCase().includes(query.toLowerCase())
                          ? undefined
                          : query,
                      stock: [],
                      page: 0,
                    });

                    close();
                  }}
                >
                  {value}
                  <span className="ml-2 inline-flex items-center justify-center px-1 h-4 rounded-full bg-blue-200 text-blue-500">
                    {hits}
                  </span>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const AutoSuggest = () => {
  const {
    setTerm: setGlobalTerm,
    query: { query = "" },
    setQuery,
  } = useQuery();
  const [value, setValue] = useState<string | null>(query);
  const {
    facets,
    items,
    results,
    setValue: setTerm,
    popularQueries,
    possibleTriggers,
    smartQuery,
  } = useAutoSuggest();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setTerm(value);
    });
  }, [value, setTerm]);
  // const applySuggestion = (value: string) => {
  //   globalThis.location.hash = queryToHash({
  //     query: value,
  //     stock: [],
  //     page: 0,
  //   });
  // };

  const showItems =
    open &&
    (items.length > 0 ||
      facets.length > 0 ||
      results.length > 0 ||
      (popularQueries != null && Object.keys(popularQueries).length > 0));

  useEffect(() => {
    const close = () => setOpen(false);
    globalThis.document.addEventListener("click", close);
    return () => globalThis.document.removeEventListener("click", close);
  }, []);

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
          value={value ?? ""}
          placeholder="Search..."
          onFocus={() => setOpen(true)}
          //onBlur={() => applySuggestion(value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              if (e.ctrlKey && smartQuery?.string?.length) {
                setQuery(smartQuery);
              } else {
                setGlobalTerm(value ?? "*");
              }

              setOpen(false);
              return;
            } else if (e.key === "ArrowRight" && results.length > 0) {
              const query = [...results[0].other, results[0].match]
                .filter((d) => d != null && d.length > 0)
                .join(" ");
              setValue(query);
              setGlobalTerm(query);
            }
            setOpen(true);
          }}
          onChange={(e) => setValue(e.target.value)}
        />
        {possibleTriggers != null && (
          <button
            onClick={() => smartQuery != null && setQuery(smartQuery)}
            className="border-b border-gray-300 absolute -top-5 left-8 border bg-yellow-100 rounded-md flex gap-2 px-2 py-1 text-xs"
          >
            {possibleTriggers.map(({ result }) =>
              result[0]?.score > MIN_SCORE ? (
                <span key={result[0].obj.value}>
                  {result[0].obj.name}{" "}
                  <span className="font-bold">{result[0].obj.value}</span>(
                  {result[0]?.score.toFixed(2)})
                </span>
              ) : null
            )}
            {smartQuery?.query != null && smartQuery.query.length > 1 && (
              <span>
                Sökning: <span className="font-bold">{smartQuery.query}</span>
              </span>
            )}
          </button>
        )}
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>
      {showItems && (
        <div
          className="absolute block top-12 left-0 right-0 bg-white border border-gray-300 rounded-b-md shadow-xl max-h-[50vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {popularQueries != null && popularQueries.length > 0 && (
            <div className="border-b border-gray-300">
              <h2 className="font-bold px-2 pt-2">Populära sökningar:</h2>
              <div className="flex flex-col gap-2 p-2">
                {popularQueries.map(({ term, fields }) => (
                  <button
                    key={term}
                    className="flex gap-2"
                    onClick={() => {
                      setQuery((prev) => ({
                        ...prev,
                        query: term,
                        string: fields.map(({ value, id }) => ({
                          id,
                          value,
                        })),
                      }));
                    }}
                  >
                    <span>{term}</span>
                    <div className="flex gap-2">
                      {fields.map(({ value, id, name }) => (
                        <div className="flex gap-2">
                          <span key={id}>{name}</span>
                          <span className="font-bold">{value.join(", ")}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="border-b border-gray-300">
            <h2 className="font-bold p-2">Förslag:</h2>
            <div className="flex gap-2">
              {results.slice(undefined, 6).map(({ hits, match, other }) => (
                <button
                  key={match}
                  className="p-2 hover:bg-gray-100"
                  onClick={() => {
                    const query = [...other, match].join(" ");
                    setValue(query);
                  }}
                >
                  {match}
                  <span className="ml-2 text-sm inline-flex items-center justify-center px-2 h-4 rounded-full bg-blue-200 text-blue-500">
                    {hits}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="border-b border-gray-300">
            <MatchingFacets
              facets={facets}
              query={value ?? ""}
              close={() => setOpen(false)}
            />
          </div>
          <div>
            <h2 className="font-bold p-2">Produkter:</h2>
            <div className="lg:grid grid-cols-2">
              {items.map((i) => (
                <Link
                  key={i.id}
                  to={`/product/${i.id}`}
                  className="p-2 hover:bg-gray-100 flex gap-2 cursor-pointer items-center"
                >
                  <img
                    src={makeImageUrl(i.img)}
                    alt={i.title}
                    className="w-10 h-10 object-contain aspect-square"
                  />
                  <span>{i.title}</span>

                  <StockIndicator stock={i.stock} stockLevel={i.stockLevel} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
