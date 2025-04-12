import { PropsWithChildren, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { cm, makeImageUrl } from "../utils";
import { Link } from "react-router-dom";
import { useQuery } from "../lib/hooks/QueryProvider";
import { StockIndicator } from "./ResultItem";
import { useSuggestions } from "../lib/hooks/useSuggestions";

const MatchingFacets = () => {
  const { facets, value: query } = useSuggestions();
  const { setQuery } = useQuery();

  const updateQuery = (value: string, id: number) => () => {
    setQuery({
      string: [{ id, value: [value] }],
      query:
        query != null && value.toLowerCase().includes(query.toLowerCase())
          ? undefined
          : query ?? undefined,
      stock: [],
      page: 0,
    });
  };

  return facets.length ? (
    <SuggestionSection title="Matchande fält">
      <div>
        {facets.map((f) => (
          <div className="p-2">
            <h2 className="font-bold">{f.name}:</h2>
            <div className="flex gap-2 flex-wrap">
              {f.values.map(({ value, hits }) => (
                <button
                  key={value}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                  onClick={updateQuery(value, f.id)}
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
    </SuggestionSection>
  ) : null;
};

let tempCanvas: HTMLCanvasElement | null = null;
const getCanvas = () => {
  if (tempCanvas == null) {
    tempCanvas = globalThis.document.createElement("canvas");
  }
  return tempCanvas;
};

const measureSize = (element: HTMLElement, text: string): number => {
  const canvas = getCanvas();
  const context = canvas.getContext("2d");
  if (context == null) {
    return 0;
  }
  context.font = getComputedStyle(element).font;
  const textWidth = context.measureText(text).width;
  return textWidth;
};

export const AutoSuggest = () => {
  const {
    query: { query = "" },
    setQuery,
  } = useQuery();
  const [value, setValue] = useState<string | null>(query);
  const [left, setLeft] = useState(0);
  const {
    suggestions,
    setValue: setTerm,
    possibleTriggers,
    hasSuggestions,
    smartQuery,
  } = useSuggestions();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setTerm(value);
    });
  }, [value, setTerm]);

  const showItems = open && hasSuggestions;

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
            const input = e.target as HTMLInputElement;

            setLeft(measureSize(input, input.value) + 30);

            if (e.key === "Enter") {
              if (
                (e.ctrlKey || e.altKey || e.metaKey) &&
                smartQuery?.string?.length
              ) {
                setQuery(smartQuery);
              } else {
                setQuery((prev) =>
                  value != null
                    ? {
                        ...prev,
                        string: [],
                        range: [],
                        page: 0,
                        query: value,
                      }
                    : prev
                );
              }

              setOpen(false);
              return;
            } else if (
              !(e.ctrlKey || e.altKey || e.metaKey) &&
              e.key === "ArrowRight" &&
              suggestions.length > 0
            ) {
              e.preventDefault();
              const query = [...suggestions[0].other, suggestions[0].match]
                .filter((d) => d != null && d.length > 0)
                .join(" ");
              setValue(query);
              //setGlobalTerm(query);
            }
            setOpen(true);
          }}
          onChange={(e) => setValue(e.target.value)}
        />
        {
          <div
            className={cm(
              "transition-opacity border border-gray-300 bg-gray-100 px-2 py-1 absolute text-xs -bottom-5 rounded-md z-20 flex gap-2",
              open && suggestions.length > 0 ? "opacity-100" : "opacity-0"
            )}
            style={{ left: `${Math.round(left)}px` }}
          >
            {suggestions.slice(undefined, 3).map(({ hits, match, other }) => (
              <button
                key={match}
                onClick={() => {
                  const query = [...other, match].join(" ");
                  setValue(query);
                }}
              >
                {match}
                <span className="ml-2 inline-flex items-center justify-center px-2 h-4 rounded-full bg-blue-200 text-blue-500">
                  {hits}
                </span>
              </button>
            ))}
            {suggestions.length > 3 && <>...</>}
          </div>
        }

        <button
          onClick={() => smartQuery != null && setQuery(smartQuery)}
          className={cm(
            "transition-opacity border-b border-gray-300 absolute -top-5 left-8 border bg-yellow-100 rounded-md flex gap-2 px-2 py-1 text-xs",
            open && possibleTriggers != null ? "opacity-100" : "opacity-0"
          )}
        >
          {possibleTriggers?.map(({ result }) =>
            result[0]?.score > 0.8 ? (
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

        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>
      {showItems && <SuggestionResults />}
    </>
  );
};

const SuggestionResults = () => {
  const { setQuery } = useQuery();
  const { popularQueries, items } = useSuggestions();
  return (
    <div
      className="absolute block top-12 left-0 right-0 bg-white border border-gray-300 rounded-b-md shadow-xl max-h-[50vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {popularQueries != null && popularQueries.length > 0 && (
        <SuggestionSection title="Populära sökningar">
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
        </SuggestionSection>
      )}
      <MatchingFacets />
      {items.length > 0 && (
        <SuggestionSection title="Produkter">
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
        </SuggestionSection>
      )}
    </div>
  );
};

const SuggestionSection = ({
  children,
  title,
}: PropsWithChildren<{ title: string }>) => {
  return (
    <div>
      <h2 className="font-bold p-2">{title}:</h2>
      {children}
    </div>
  );
};
