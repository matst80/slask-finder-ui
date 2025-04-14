import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Search } from "lucide-react";
import { cm, makeImageUrl } from "../utils";
import { Link } from "react-router-dom";
import { useQuery } from "../lib/hooks/QueryProvider";
import { StockIndicator } from "./ResultItem";
import { useSuggestions } from "../lib/hooks/useSuggestions";
import { trackClick } from "../lib/datalayer/beacons";
import { CmsPicture } from "../lib/types";
import { PriceValue } from "./Price";
import { MIN_FUZZY_SCORE } from "../lib/hooks/SuggestionProvider";
import fuzzysort from "fuzzysort";

const byCategoryLevel = (
  a: { categoryLevel?: number },
  b: { categoryLevel?: number }
) => {
  if (a.categoryLevel == null || b.categoryLevel == null) {
    return 0;
  }
  return b.categoryLevel - a.categoryLevel;
};

const byMatch =
  (query?: string | null) =>
  (a: { value: string; hits: number }, b: { value: string; hits: number }) => {
    if (query == null) {
      return b.hits - a.hits;
    }
    const aMatch = a.value.toLowerCase().includes(query.toLowerCase());
    const bMatch = b.value.toLowerCase().includes(query.toLowerCase());

    if (aMatch && !bMatch) {
      return -1;
    } else if (!aMatch && bMatch) {
      return 1;
    }
    return b.hits - a.hits;
  };

const MatchingFacets = () => {
  const { facets, value: query } = useSuggestions();
  const { setQuery } = useQuery();
  const [categories, other] = useMemo(() => {
    const [a, b] = facets
      .filter(
        (f) =>
          (f.valueType != null && f.valueType != "") ||
          (f.categoryLevel != null && f.categoryLevel > 0)
      )
      .reduce(
        ([cat, rest], f) => {
          if (f.categoryLevel != null && f.categoryLevel > 0) {
            return [[...cat, f], rest];
          }
          return [cat, [...rest, f]];
        },
        [[], []] as [typeof facets, typeof facets]
      );
    return [
      a.sort(byCategoryLevel).flatMap(({ id, categoryLevel, values }) =>
        values.map((value) => ({
          ...value,
          id,
          categoryLevel,
        }))
      ),
      b,
    ];
  }, [facets]);

  const sortedCategories = useMemo(
    () =>
      fuzzysort
        .go(query ?? "", categories, {
          limit: 10,
          threshold: -100,
          keys: ["value"],
        })
        .map((d) => d.obj),

    [categories, query]
  );

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

  const setCategory = (value: string, id: number) => () => {
    setQuery({
      string: [{ id, value: [value] }],
      query: undefined,
      stock: [],
      page: 0,
    });
  };

  return other.length ? (
    <div className="bg-gray-100 border-t border-gray-200 p-2 grid grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col flex-wrap gap-1 p-2 text-sm">
        {sortedCategories.map(({ hits, value, id }) => (
          <button
            key={value}
            className="text-left flex gap-2 items-center"
            onClick={setCategory(value, id)}
          >
            Kategori: {value}
            <span className="ml-2 inline-flex items-center justify-center px-1 h-4 rounded-full bg-blue-200 text-blue-500">
              {hits}
            </span>
          </button>
        ))}
      </div>
      <div className="hidden md:block">
        {other.map((f) => (
          <div
            key={f.id}
            className="flex gap-2 flex-wrap p-2 text-sm items-center"
          >
            <span className="font-bold">{f.name}: </span>
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
        ))}
      </div>
    </div>
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

const useCursorPosition = (
  ref: React.RefObject<HTMLInputElement>,
  { useCursorPosition = true }: { useCursorPosition?: boolean } = {}
) => {
  const [left, setLeft] = useState(0);

  const updatePosition = useCallback(() => {
    const input = ref?.current;
    if (input == null) {
      return;
    }
    const position = input.selectionStart ?? 0;
    const text = useCursorPosition
      ? input.value.substring(0, position)
      : input.value;
    setLeft(Math.round(measureSize(input, text)));
  }, [ref, useCursorPosition]);

  useEffect(() => {
    const input = ref?.current;
    if (input == null) {
      return;
    }

    input.addEventListener("focus", updatePosition);
    input.addEventListener("change", updatePosition);
    return () => {
      input.removeEventListener("focus", updatePosition);
      input.removeEventListener("change", updatePosition);
    };
  }, [ref, updatePosition]);

  return { left, updatePosition };
};

const TrieSuggestions = ({
  toShow,
  open,
  left,
  onQueryChange,
  max = 10,
}: {
  toShow: number;
  max?: number;
  open: boolean;
  left: number;
  onQueryChange: (query: string) => void;
}) => {
  const { suggestions } = useSuggestions();
  const [showMore, setShowMore] = useState(false);
  const [visible, hasMore] = useMemo(() => {
    const l = showMore ? max : toShow;
    const visible = suggestions.slice(0, l);
    const hasMore = suggestions.length > l;
    return [visible, hasMore];
  }, [toShow, max, showMore, suggestions]);
  return (
    <div
      className={cm(
        "transition-opacity border border-gray-200 bg-gray-100/50 hover:bg-gray-100/20 px-2 py-1 absolute text-xs top-2 bottom-2 rounded-md z-20 flex gap-2 items-center",
        open && suggestions.length > 0 ? "opacity-100" : "opacity-0"
      )}
      style={{ left: `${left + 50}px` }}
    >
      {visible.map(({ hits, match, other }) => (
        <button
          key={match}
          onClick={() => onQueryChange([...other, match].join(" "))}
        >
          {match}
          <span className="ml-2 inline-flex items-center justify-center px-2 h-4 rounded-full bg-blue-200 text-blue-500">
            {hits}
          </span>
        </button>
      ))}
      {hasMore && <button onClick={() => setShowMore((p) => !p)}>...</button>}
    </div>
  );
};

export const AutoSuggest = () => {
  const { query: globalQuery, setQuery } = useQuery();
  const inputRef = useRef<HTMLInputElement>(null);
  const { left, updatePosition } = useCursorPosition(inputRef, {
    useCursorPosition: false,
  });
  const [value, setValue] = useState<string | null>(globalQuery.query ?? "");

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
      updatePosition();
    });
  }, [value, setTerm, updatePosition]);

  const showItems = open && hasSuggestions;

  const onKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const input = e.target as HTMLInputElement;
      const isAtEnd = input.selectionEnd == input.value.length;
      const bestSuggestion = suggestions[0];
      if (e.key === "Enter") {
        if (
          (e.ctrlKey || e.altKey || e.metaKey) &&
          smartQuery?.string?.length
        ) {
          setQuery(smartQuery);
        } else {
          setQuery((prev) => ({
            ...prev,
            string: [],
            range: [],
            page: 0,
            query: input.value,
          }));
        }

        setOpen(false);
        return;
      } else if (isAtEnd && e.key === "ArrowRight" && bestSuggestion != null) {
        const query = [...bestSuggestion.other, bestSuggestion.match]
          .filter((d) => d != null && d.length > 0)
          .join(" ");
        setValue(query);
        //setGlobalTerm(query);
      }
      setOpen(true);
    },
    [suggestions, smartQuery, setQuery]
  );

  useEffect(() => {
    const close = () => setOpen(false);
    globalThis.document.addEventListener("click", close);
    return () => globalThis.document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [globalQuery]);

  const { query } = globalQuery;
  useEffect(() => {
    if (query != null) {
      setValue(query);
    }
  }, [query]);

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
          ref={inputRef}
          className="w-full pl-10 pr-4 py-2 transition-all border border-gray-300 rounded-md focus:outline-none focus:rounded-b-none"
          type="search"
          value={value ?? ""}
          placeholder="Search..."
          onFocus={() => setOpen(true)}
          onKeyUp={onKeyUp}
          onChange={(e) => setValue(e.target.value)}
        />
        <TrieSuggestions
          onQueryChange={setValue}
          open={open}
          left={left}
          toShow={1}
          max={5}
        />

        <button
          onClick={() => smartQuery != null && setQuery(smartQuery)}
          className={cm(
            "transition-all border-b border-gray-300 absolute -top-5 left-8 border overflow-x-auto bg-yellow-100 rounded-md flex gap-2 px-2 py-1 text-xs",
            open && possibleTriggers != null ? "opacity-100" : "opacity-0"
          )}
        >
          {possibleTriggers?.map(({ result }) =>
            result[0]?.score > MIN_FUZZY_SCORE ? (
              <span key={result[0].obj.value}>
                {result[0].obj.name}{" "}
                <span className="font-bold">{result[0].obj.value}</span>
              </span>
            ) : null
          )}
          {smartQuery?.query != null && smartQuery.query.length > 1 && (
            <span className="hidden md:block">
              Sökning: <span className="font-bold">{smartQuery.query}</span>
            </span>
          )}
          <span className="text-[10px]">⌥ + ↵</span>
        </button>

        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>
      <SuggestionResults open={showItems} />
    </>
  );
};

const SuggestionResults = ({ open }: { open: boolean }) => {
  const { setQuery } = useQuery();
  const { popularQueries, items } = useSuggestions();
  return (
    <div
      className={cm(
        "transition-all absolute block top-11 left-0 right-0 bg-white border-gray-300 rounded-b-md overflow-y-auto border-t-0",
        open ? "shadow-xl max-h-[70vh] border" : "shadow-none max-h-0"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {popularQueries != null && popularQueries.length > 0 && (
        <SuggestionSection title="Populära sökningar">
          <div className="flex flex-col gap-2 p-2">
            {popularQueries.slice(undefined, 5).map(({ term, fields }) => (
              <button
                key={term}
                className="flex gap-2 items-center text-left"
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
                <div className="flex gap-2 text-xs">
                  {fields.map(({ value, id, name }) => (
                    <div
                      key={id}
                      className="px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                    >
                      <span key={id}>{name} </span>
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
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {items.map((i, idx) => (
              <Link
                key={i.id}
                onClick={() => trackClick(i.id, idx)}
                to={`/product/${i.id}`}
                className="p-2 hover:bg-gray-100 flex gap-2 cursor-pointer items-center w-full"
              >
                <img
                  src={makeImageUrl(i.img)}
                  alt={i.title}
                  className="w-10 h-10 object-contain aspect-square"
                />
                <div className="flex flex-col flex-1">
                  <span>{i.title}</span>
                  <StockIndicator stock={i.stock} stockLevel={i.stockLevel} />
                </div>
                <span className="font-bold text-lg justify-end">
                  <PriceValue value={i.values[4]} />
                </span>
              </Link>
            ))}
          </div>
        </SuggestionSection>
      )}
      <ContentHits />
    </div>
  );
};

const ParsedImage = ({ picture }: { picture?: CmsPicture }) => {
  if (picture == null) {
    return null;
  }
  const { alt, uris } = picture;
  const images = uris.filter(({ images }) => images.some((d) => d.imageURL));
  const image = images[0]?.images[0];
  if (image == null) {
    return null;
  }
  const src = makeImageUrl(image.imageURL);
  return (
    <img
      alt={alt ?? ""}
      src={src}
      className="w-full object-contain aspect-video"
    />
  );
};

const ContentHits = () => {
  const { content } = useSuggestions();

  return content?.length ? (
    <SuggestionSection title="Innehåll">
      <div className="overflow-x-auto max-w-full">
        <div className="flex flex-nowrap">
          {content.map(({ id, name, description, picture, url }) => (
            <div key={id} className="p-2 flex-shrink-0 w-[300px]">
              <ParsedImage picture={picture} />
              <h3 className="font-bold line-clamp-1 text-ellipsis">{name}</h3>
              <p className="line-clamp-3 text-ellipsis">{description}</p>
              <a
                href={url}
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {name}
              </a>
            </div>
          ))}
        </div>
      </div>
    </SuggestionSection>
  ) : null;
};

const SuggestionSection = ({
  children,
  title,
}: PropsWithChildren<{ title: string }>) => {
  return (
    <div>
      <h2 className="font-bold p-2">{title}:</h2>
      <div>{children}</div>
    </div>
  );
};
