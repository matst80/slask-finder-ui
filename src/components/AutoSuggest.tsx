import {
  createElement,
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ChevronUp, Lightbulb, Search, SearchIcon } from "lucide-react";
import { cm, makeImageUrl } from "../utils";
import { useNavigate } from "react-router-dom";
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
import { useTracking } from "../lib/hooks/TrackingContext";
import { toEcomTrackingEvent } from "./toImpression";
import { useDropdownFocus } from "./useDropdownFocus";
import { useArrowKeyNavigation } from "./useArrowKeyNavigation";
import { useProductData } from "../lib/utils";

const TrieSuggestions = ({
  toShow,
  left,
  onQueryChange,
  max = 10,
}: {
  toShow: number;
  max?: number;
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
  if (visible.length === 0) {
    return null;
  }
  return (
    <div
      className={
        "trie attachment transition-opacity border border-gray-100 bg-gray-50 hover:bg-gray-100/20 px-2 py-1 absolute text-xs top-2 bottom-2 rounded-md z-20 flex gap-2 items-baseline"
      }
      style={{ left: `${left + 22}px` }}
    >
      {visible.map(({ hits, match, other }) => (
        <button
          key={match}
          onClick={(e) => {
            e.preventDefault();
            onQueryChange([...other, match].join(" "));
          }}
        >
          {match}
          <span className="ml-2 hidden md:inline-flex items-center justify-center px-2 h-4 rounded-full bg-blue-200 text-blue-500">
            {hits}
          </span>
        </button>
      ))}
      {hasMore && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMore((p) => !p);
          }}
        >
          ...
        </button>
      )}
    </div>
  );
};

export const AutoSuggest = () => {
  const { query: globalQuery, setQuery, hits } = useQuery();

  const { inputRef, close, open } = useDropdownFocus({
    onOpen: () => {
      updatePosition();
    },
    onClose: () => {},
  });
  const parentRef = useArrowKeyNavigation<HTMLFieldSetElement>(
    ".suggest-result button",
    {
      onEscape: () => {
        inputRef.current?.value === "";
      },
      onNotFound: () => inputRef.current?.focus(),
    }
  );
  const { left, updatePosition } = useCursorPosition(inputRef, {
    useCursorPosition: false,
  });

  const {
    suggestions,
    setValue: setTerm,
    possibleTriggers,
    smartQuery,
  } = useSuggestions();

  const onKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      open();
      const input = e.currentTarget;
      const isAtEnd = input.selectionEnd == input.value.length;
      const bestSuggestion = suggestions[0];
      if (e.key === "Enter" && (e.altKey || e.metaKey) && smartQuery != null) {
        e.preventDefault();
        e.stopPropagation();
        if (smartQuery != null) {
          setQuery(smartQuery);
        }
      }
      if (isAtEnd && e.key === "ArrowRight" && bestSuggestion != null) {
        const query = [...bestSuggestion.other, bestSuggestion.match]
          .filter((d) => d != null && d.length > 0)
          .join(" ");

        input.value = query;

        setTerm(query);
      }
      updatePosition();
    },
    [suggestions, setTerm, smartQuery]
  );

  useEffect(() => {
    if (globalQuery.query != null && inputRef.current != null) {
      inputRef.current.value = globalQuery.query;
    }
    requestAnimationFrame(() => {
      updatePosition();
    });
  }, [globalQuery, inputRef]);

  useEffect(() => {
    requestAnimationFrame(() => {
      const results = document.getElementById("results");
      if (results != null) {
        (results.children[0] as HTMLElement)?.focus({ preventScroll: false });
      }
    });
  }, [hits]);

  return (
    <form
      onSubmit={(e) => {
        const { query } = Object.fromEntries(
          new FormData(e.target as HTMLFormElement)
        );

        e.preventDefault();

        if (query != null && typeof query === "string" && query.length > 0) {
          setQuery((prev) => ({
            ...prev,
            string: [],
            range: [],
            page: 0,
            query: query,
          }));
        }
      }}
    >
      <fieldset ref={parentRef}>
        <div className="relative md:flex-1 flex flex-col md:block border-gray-200 has-attachments">
          <input
            ref={inputRef}
            accessKey="f"
            className="w-full pr-10 pl-4 py-2 md:border border-gray-300 shrink-0 outline-hidden md:rounded-md suggest-input"
            type="search"
            onKeyUp={onKeyUp}
            onInput={(e) => {
              setTerm(e.currentTarget.value);

              if (e.currentTarget.value.length === 0) {
                // console.log("cleared");
                setQuery((prev) => ({ ...prev, query: "" }));
              }
            }}
            name="query"
            id="autosuggest-input"
            autoComplete="off"
            defaultValue={globalQuery.query ?? ""}
            aria-controls="suggestion-results"
            placeholder="Search..."
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            <Search aria-hidden="true" size={20} />
          </button>
          <TrieSuggestions
            onQueryChange={(v) => {
              if (inputRef.current != null) {
                inputRef.current.value = v;
              }
            }}
            //open={open}
            left={left}
            toShow={1}
            max={5}
          />

          {smartQuery != null && (
            <button
              onClick={(e) => {
                e.preventDefault();
                smartQuery != null && setQuery(smartQuery);
              }}
              className="attachment transition-opacity border-b border-yellow-200 py-2 fixed md:absolute bottom-3 md:bottom-auto left-3 right-3 md:right-auto md:-top-5 md:left-2 border overflow-x-auto bg-yellow-100 rounded-md flex gap-2 px-2 md:py-1 text-xs"
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
              <span
                aria-label="option + enter to search"
                className="text-[10px] hidden md:block"
              >
                ⌥ + ↵
              </span>
            </button>
          )}
        </div>
        <SuggestionResults onClose={close} />
      </fieldset>
    </form>
  );
};

const SuggestionResults = ({
  //open,
  onClose,
}: //selectedIndex,
{
  //open: boolean;
  //selectedIndex: number;
  onClose: () => void;
}) => {
  const { items } = useSuggestions();

  return (
    <div
      id="suggestion-results"
      aria-labelledby="autosuggest-input"
      aria-label="Suggestion results"
      className="transition-opacity md:rounded-md md:border md:border-gray-300 bg-white overflow-y-auto suggest-result md:shadow-xl max-h-[70vh]"
    >
      {items.map((item, idx) => (
        <SuggestSelector
          {...item}
          key={idx}
          //selected={idx == selectedIndex}
          index={idx}
        />
      ))}
      <button
        onClick={onClose}
        className="md:hidden absolute top-13 right-3 rounded-full bg-white p-1 z-20"
      >
        <ChevronUp className="size-6" />
      </button>
    </div>
  );
};

const SuggestedProduct = (item: SuggestedProduct & { index: number }) => {
  const { id, title, img, values, stock } = item;
  const { stockLevel, soldBy, isOutlet, grade, isOwn } = useProductData(values);
  const { track } = useTracking();
  const navigate = useNavigate();
  return (
    <button
      onClick={() => {
        track({ type: "click", item: toEcomTrackingEvent(item, item.index) });
        navigate(`/product/${id}`);
      }}
      className="p-2 flex gap-2 w-full text-left items-center relative"
    >
      <img
        src={makeImageUrl(img)}
        alt={title}
        className="w-10 h-10 object-contain aspect-square mix-blend-multiply"
      />
      <div className="absolute md:static right-2">
        <StockBalloon stock={stock} stockLevel={stockLevel} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span>{title}</span>
        </div>

        {isOutlet && grade != null && (
          <em className="block text-xs text-gray-500 italic">{grade}</em>
        )}
        {!isOwn && (
          <em className="block text-xs text-gray-500 italic">
            Säljs av: {soldBy}
          </em>
        )}
      </div>
    </button>
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
    <ItemContainer
      as="button"
      className="items-center"
      onClick={() => setQuery({ string: [{ id: facetId, value: [value] }] })}
    >
      <Lightbulb className="size-5" />

      <span>
        {facetName} {value}
      </span>
    </ItemContainer>
  );
};

const PopularRefinement = ({
  facetId,
  query,
  values,
}: //selected,
QueryRefinement) => {
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
    <button
      className="items-center p-2 flex gap-2 cursor-pointer w-full text-left"
      onClick={() => {
        const first = items?.[0];

        setQuery({
          query,
          string: first != null ? [{ id: facetId, value: [first.value] }] : [],
        });
      }}
    >
      <Lightbulb className="size-5 shrink-0" />
      <span>{query}</span>
      <div className="flex gap-2 flex-nowrap overflow-x-auto items-center flex-1">
        {items?.slice(0, 3).map(({ value, hits }) => (
          <div
            key={value}
            aria-label="Filter with"
            role="button"
            className="shrink-0 border line-clamp-1 text-ellipsis border-gray-100 bg-gray-50 hover:bg-gray-100/20 px-2 py-1 text-xs rounded-md z-20 flex gap-2 items-center"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setQuery({
                string: [{ id: facetId, value: [value] }],
                query,
                stock: [],
                page: 0,
              });
            }}
          >
            {value} <span aria-label="Number of hits">{hits}</span>
          </div>
        ))}
      </div>
    </button>
  );
};

const ItemContainer = <T extends keyof HTMLElementTagNameMap>({
  children,

  as,
  className,
  ...props
}: {
  children: ReactNode[];
  as: T;
} & Omit<HTMLAttributes<T>, "children">) => {
  return createElement(
    as,
    {
      ...props,
      className: cm(
        "p-2 flex gap-2 cursor-pointer w-full text-left",
        className
        //"hover:bg-gray-100" //selected ? "bg-blue-200 hover:bg-blue-400" :
      ),
      //"aria-selected": selected,
    },
    children
  );
};

const SuggestedQuery = ({ query, fields }: SuggestQuery) => {
  const { setQuery } = useQuery();

  const updateQuery =
    (id?: number, value?: string): MouseEventHandler<unknown> =>
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      setQuery({
        string: id != null && value != null ? [{ id, value: [value] }] : [],
        query,
        stock: [],
        page: 0,
      });
    };
  return (
    <ItemContainer
      as="button"
      className={"items-center"}
      onClick={updateQuery(fields[0]?.id, fields[0]?.values?.[0]?.value)}
    >
      <SearchIcon className="size-5 shrink-0" />
      <span>{query}</span>
      <div className="flex gap-2 flex-nowrap overflow-x-auto items-center flex-1">
        {fields.slice(undefined, 2).map(({ id, name, values }) => {
          const { value } = values[0];
          return (
            <div
              key={id}
              className="shrink-0 border line-clamp-1 text-ellipsis border-gray-100 bg-gray-50 hover:bg-gray-100/20 px-2 py-1 text-xs rounded-md z-20 flex gap-2 items-center"
              onClick={updateQuery(id, value)}
            >
              {name}: {value}
              {/* <span className="ml-2 inline-flex items-center justify-center px-1 h-4 rounded-full bg-blue-200 text-blue-500">
                {hits}
              </span> */}
            </div>
          );
        })}
      </div>
    </ItemContainer>
  );
};

const SuggestSelector = (props: SuggestResultItem & { index: number }) => {
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
