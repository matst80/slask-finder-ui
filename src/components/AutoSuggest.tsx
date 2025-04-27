import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronUp, Lightbulb, Search, SearchIcon } from "lucide-react";
import { cm, makeImageUrl } from "../utils";
import { Link } from "react-router-dom";
import { useQuery } from "../lib/hooks/useQuery";
import { StockBalloon } from "./ResultItem";
import { useSuggestions } from "../lib/hooks/useSuggestions";
import { CmsPicture } from "../lib/types";
import { MIN_FUZZY_SCORE } from "../lib/hooks/SuggestionProvider";
import { SuggestQuery } from "../lib/hooks/suggestionUtils";
import { useCursorPosition } from "./useCursorPosition";
import type {
  QueryRefinement,
  SuggestedContent,
  SuggestedProduct,
  SuggestResultItem,
} from "../lib/hooks/suggestionContext";
import { useKeyFacetValuePopularity } from "../hooks/popularityHooks";

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
        "transition-opacity border border-gray-100 bg-gray-50 hover:bg-gray-100/20 px-2 py-1 absolute text-xs top-2 bottom-2 rounded-md z-20 flex gap-2 items-baseline",
        open && suggestions.length > 0
          ? "opacity-100 animate-pop"
          : "opacity-0 pointer-events-none"
      )}
      style={{ left: `${left + 22}px` }}
    >
      {visible.map(({ hits, match, other }) => (
        <button
          key={match}
          onClick={() => onQueryChange([...other, match].join(" "))}
        >
          {match}
          <span className="ml-2 hidden md:inline-flex items-center justify-center px-2 h-4 rounded-full bg-blue-200 text-blue-500">
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
    smartQuery,
    items,
  } = useSuggestions();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setTerm(value === "*" ? "" : value);
      updatePosition();
    });
  }, [value, setTerm, updatePosition]);

  const hasResults = items.length > 0;
  const showItems = open && items.length > 0;

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
          if (hasResults || input.value == null || input.value.length < 2) {
            setQuery((prev) => ({
              ...prev,
              string: [],
              range: [],
              page: 0,
              query: input.value,
            }));
          }
        }

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
    [suggestions, smartQuery, setQuery, hasResults]
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
        className="relative md:flex-1 flex flex-col"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <input
          ref={inputRef}
          className="w-full pr-10 pl-4 py-2 transition-all md:border border-gray-300 shrink-0 md:rounded-md focus:outline-hidden"
          type="search"
          value={value ?? ""}
          placeholder="Search..."
          onFocus={(e) => {
            e.target.select();
            setOpen(true);
          }}
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
            "transition-opacity border-b border-yellow-200 absolute -top-5 left-8 border overflow-x-auto bg-yellow-100 rounded-md flex gap-2 px-2 py-1 text-xs",
            open && possibleTriggers != null
              ? "animate-pop"
              : "opacity-0 pointer-events-none"
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
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>
      <SuggestionResults open={showItems} onClose={() => setOpen(false)} />
    </>
  );
};

const SuggestedProduct = ({
  id,
  title,
  img,
  values,
  stock,
  stockLevel,
}: SuggestedProduct) => {
  return (
    <Link
      to={`/product/${id}`}
      className="p-2 hover:bg-gray-100 flex gap-2 cursor-pointer items-center w-full"
    >
      <img
        src={makeImageUrl(img)}
        alt={title}
        className="w-10 h-10 object-contain aspect-square mix-blend-multiply"
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span>{title}</span>
          <StockBalloon stock={stock} stockLevel={stockLevel} />
        </div>

        {values?.["10"] == "Outlet" && values?.["20"] != null && (
          <em className="block text-xs text-gray-500 italic">{values["20"]}</em>
        )}
        {values?.["9"] != null && values?.["9"] != "Elgiganten" && (
          <em className="block text-xs text-gray-500 italic">
            Säljs av: {values["9"]}
          </em>
        )}
      </div>
    </Link>
  );
};

const ContentHit = ({ name, description, picture, url }: SuggestedContent) => {
  return (
    <div className="p-2 hover:bg-gray-100 flex gap-2 cursor-pointer items-center w-full">
      <ParsedImage picture={picture} />
      <div className="flex flex-col flex-1">
        <span>{name}</span>
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
    </div>
  );
};

const FlatRefinement = ({ facetId, facetName, values }: QueryRefinement) => {
  const { setQuery } = useQuery();
  const { value } = values[0];
  return (
    <button
      className="p-2 hover:bg-gray-100 flex gap-2 cursor-pointer items-center w-full"
      onClick={() => setQuery({ string: [{ id: facetId, value: [value] }] })}
    >
      <Lightbulb className="size-5" />

      <span>
        {facetName} {value}
      </span>
    </button>
  );
};

const PopularRefinement = ({ facetId, query, values }: QueryRefinement) => {
  const { setQuery } = useQuery();
  const { data } = useKeyFacetValuePopularity(facetId);
  const items = useMemo(() => {
    if (data == null || values == null) {
      return [];
    }
    return values
      ?.map(({ value, hits }) => ({
        value,
        hits,
        popularity: data?.find((d) => d.value === value)?.score ?? 0,
      }))
      .sort((a, b) => b.popularity - a.popularity);
  }, [data, values]);
  return (
    <div className="p-2 hover:bg-gray-100 flex gap-2 cursor-pointer items-center w-full">
      <Lightbulb className="size-5" />
      <span>{query}</span> i
      {items?.slice(0, 3).map(({ value, hits }) => (
        <button
          key={value}
          className="shrink-0 border line-clamp-1 text-ellipsis border-gray-100 bg-gray-50 hover:bg-gray-100/20 px-2 py-1 text-xs rounded-md z-20 flex gap-2 items-center"
          onClick={() => {
            setQuery({
              string: [{ id: facetId, value: [value] }],
              query,
              stock: [],
              page: 0,
            });
          }}
        >
          {value} ({hits})
        </button>
      ))}
    </div>
  );
};

const SuggestedQuery = ({ query, fields }: SuggestQuery) => {
  const { setQuery } = useQuery();
  if (fields == null || fields.length === 0) {
    return null;
  }
  const updateQuery =
    (id: number, value: string): React.MouseEventHandler<HTMLButtonElement> =>
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      setQuery({
        string: [{ id, value: [value] }],
        query,
        stock: [],
        page: 0,
      });
    };
  return (
    <button
      className="p-2 hover:bg-gray-100 flex gap-2 cursor-pointer items-center w-full"
      onClick={updateQuery(fields[0].id, fields[0].values[0].value)}
    >
      <SearchIcon className="size-5 shrink-0" />
      <span>{query}</span>
      <div className="flex gap-2 flex-nowrap overflow-x-auto items-center flex-1">
        {fields.slice(undefined, 2).map(({ id, name, values }) => {
          const { value } = values[0];
          return (
            <button
              key={id}
              className="shrink-0 border line-clamp-1 text-ellipsis border-gray-100 bg-gray-50 hover:bg-gray-100/20 px-2 py-1 text-xs rounded-md z-20 flex gap-2 items-center"
              onClick={updateQuery(id, value)}
            >
              {name}: {value}
              {/* <span className="ml-2 inline-flex items-center justify-center px-1 h-4 rounded-full bg-blue-200 text-blue-500">
                {hits}
              </span> */}
            </button>
          );
        })}
      </div>
    </button>
  );
};

const SuggestSelector = (props: SuggestResultItem) => {
  const { type } = props;
  switch (type) {
    case "product":
      return <SuggestedProduct {...props} />;
    case "content":
      return <ContentHit {...props} />;
    case "refinement":
      if (props.flat) {
        return <FlatRefinement {...props} />;
      }
      return <PopularRefinement {...props} />;
    case "query":
      return <SuggestedQuery {...props} />;
    default:
      return null;
  }
};

const SuggestionResults = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { items } = useSuggestions();
  return (
    <div
      className={cm(
        "transition-all md:absolute md:rounded-md md:border md:border-gray-300 block top-13 left-0 right-0 bg-white overflow-y-auto md:pt-1",
        open
          ? "md:shadow-xl max-h-[70vh] animate-suggestbox flex-1"
          : "md:shadow-none max-h-0 opacity-0"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <SuggestSelector {...item} />
      ))}
      <button
        onClick={onClose}
        className="md:hidden absolute top-12 right-4 rounded-full bg-white p-1"
      >
        <ChevronUp className="size-6" />
      </button>
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
