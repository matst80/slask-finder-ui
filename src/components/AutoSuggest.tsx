import {
  createElement,
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

const TrieSuggestions = ({
  toShow,
  //open,
  left,
  onQueryChange,
  max = 10,
}: {
  toShow: number;
  max?: number;
  //open: boolean;
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
      className={cm(
        "trie transition-opacity border border-gray-100 bg-gray-50 hover:bg-gray-100/20 px-2 py-1 absolute text-xs top-2 bottom-2 rounded-md z-20 flex gap-2 items-baseline"
        // open && suggestions.length > 0
        //   ? "opacity-100 animate-pop"
        //   : "opacity-0 pointer-events-none"
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

const useSelectedIndex = () => {
  const [itemLength, setItemLength] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        setSelectedIndex((prev) => Math.min(prev + 1, itemLength));
      } else if (e.key === "ArrowUp") {
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      }
    },
    [setSelectedIndex, itemLength]
  );
  const triggerClick = useCallback(() => {
    const item = document.querySelector(
      `.suggest-result [aria-selected="true"]`
    ) as HTMLElement;
    console.log("triggerClick", item);
    if (item != null) {
      item.click();
    }
  }, []);
  useEffect(() => {
    setSelectedIndex(-1);
  }, [itemLength]);
  return { selectedIndex, onKeyDown, setItemLength, triggerClick };
};

export const AutoSuggest = () => {
  const { query: globalQuery, setQuery } = useQuery();
  const inputRef = useRef<HTMLInputElement>(null);
  const { left, updatePosition } = useCursorPosition(inputRef, {
    useCursorPosition: false,
  });
  const [value, setValue] = useState<string | null>(globalQuery.query ?? "");
  const { onKeyDown, selectedIndex, setItemLength, triggerClick } =
    useSelectedIndex();

  const {
    suggestions,
    setValue: setTerm,
    possibleTriggers,
    smartQuery,
    items,
  } = useSuggestions();

  //const [open, setOpen] = useState(false);

  // useEffect(() => {
  //   requestAnimationFrame(() => {
  //     setTerm(value === "*" ? "" : value);
  //     updatePosition();
  //   });
  // }, [value, setTerm, updatePosition]);

  useEffect(() => {
    setItemLength(items.length);
  }, [items]);

  // const [hasResults, showItems] = useMemo(() => {
  //   const a = items.length > 0;
  //   return [a, open && a];
  // }, [items, open]);

  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const isAtEnd = input.selectionEnd == input.value.length;
    const bestSuggestion = suggestions[0];
    if (e.key === "Enter") {
      if ((e.ctrlKey || e.altKey || e.metaKey) && smartQuery?.string?.length) {
        setQuery(smartQuery);
      } else {
        console.log("onKeyUp", { selectedIndex, value: input.value });
        if (selectedIndex > -1) {
          triggerClick();
          return;
        }
        if (input.value != null) {
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
      //setValue(query);
      input.value = query;
      setTerm(query);
      //setGlobalTerm(query);
    }
    //setOpen(true);
  };

  // useEffect(() => {
  //   const close = () => setOpen(false);
  //   globalThis.document.addEventListener("click", close);
  //   return () => globalThis.document.removeEventListener("click", close);
  // }, []);

  // useEffect(() => {
  //   setOpen(false);
  // }, [globalQuery]);

  const { query } = globalQuery;
  useEffect(() => {
    if (query != null && inputRef.current != null) {
      inputRef.current.value = query;
    }
  }, [query]);

  useEffect(() => {
    if (inputRef.current != null) {
      const elm = inputRef.current;
      const targetId = inputRef.current.getAttribute("aria-controls");
      const targetElm =
        targetId != null ? document.getElementById(targetId) : undefined;

      const changeHandler = (e: Event) => {
        const input = e.target as HTMLInputElement;
        //setValue(input.value);
        requestAnimationFrame(() => {
          setTerm(input.value);
          updatePosition();
        });
      };
      const focusHandler = (e: FocusEvent) => {
        //console.log("focusHandler", { targetElm, targetId });
        targetElm?.setAttribute("aria-hidden", "false");
        elm.setAttribute("aria-expanded", "true");
      };
      const blurHandler = (e: FocusEvent) => {
        // console.log("blurHandler", e);
        // const input = e.target as HTMLInputElement;
        const focusElement = e.relatedTarget as HTMLElement;
        const shouldClose =
          focusElement == null ||
          !(
            focusElement.classList.contains("smart-query") ||
            focusElement.classList.contains("trie") ||
            focusElement.parentElement == targetElm
          );
        if (shouldClose) {
          requestAnimationFrame(() => {
            targetElm?.setAttribute("aria-hidden", "true");
            elm.setAttribute("aria-expanded", "false");
          });
        }
      };
      //setValue(elm.value);
      setTerm(elm.value);
      elm.addEventListener("input", changeHandler);
      elm.addEventListener("focus", focusHandler);
      elm.addEventListener("blur", blurHandler);

      return () => {
        elm?.removeEventListener("input", changeHandler);
        elm?.removeEventListener("focus", focusHandler);
        elm?.removeEventListener("blur", blurHandler);
        targetElm?.setAttribute("aria-hidden", "true");
        elm?.setAttribute("aria-expanded", "false");
      };
    }
  }, [inputRef, updatePosition, setTerm]);

  return (
    <>
      <div
        className={cm(
          "relative md:flex-1 flex flex-col md:block border-gray-200"
          //"border-b md:border-b-0"
        )}
        // onClick={(e) => {
        //   e.stopPropagation();
        //   setOpen(true);
        // }}
      >
        <input
          ref={inputRef}
          accessKey="f"
          className={cm(
            "w-full pr-10 pl-4 py-2 md:border border-gray-300 shrink-0 outline-hidden",
            "md:rounded-md focus:md:rounded-b-none suggest-input"
          )}
          type="search"
          id="autosuggest-input"
          onKeyDown={onKeyDown}
          //value={value ?? ""}
          defaultValue={value ?? ""}
          aria-controls="suggestion-results"
          placeholder="Search..."
          // onFocus={() => {
          //   //e.target.select();
          //   setOpen(true);
          // }}
          onKeyUp={onKeyUp}
          //onChange={(e) => setValue(e.target.value)}
        />
        <TrieSuggestions
          onQueryChange={setValue}
          //open={open}
          left={left}
          toShow={1}
          max={5}
        />

        {smartQuery != null && (
          <button
            onClick={() => smartQuery != null && setQuery(smartQuery)}
            className={cm(
              "smart-query transition-opacity border-b border-yellow-200 py-2 fixed md:absolute bottom-3 md:bottom-auto left-3 right-3 md:right-auto md:-top-5 md:left-2 border overflow-x-auto bg-yellow-100 rounded-md flex gap-2 px-2 md:py-1 text-xs"
              // open && possibleTriggers != null
              //   ? "animate-pop"
              //   : "opacity-0 pointer-events-none"
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
            <span
              aria-label="option + enter to search"
              className="text-[10px] hidden md:block"
            >
              ⌥ + ↵
            </span>
          </button>
        )}

        <Search
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          aria-hidden="true"
          size={20}
        />
      </div>
      <SuggestionResults
        //open={showItems}
        selectedIndex={selectedIndex}
        onClose={() => {
          inputRef.current?.setAttribute("aria-expanded", "false");
        }}
      />
    </>
  );
};

const SuggestionResults = ({
  //open,
  onClose,
  selectedIndex,
}: {
  //open: boolean;
  selectedIndex: number;
  onClose: () => void;
}) => {
  const { items } = useSuggestions();

  return (
    <div
      id="suggestion-results"
      aria-labelledby="autosuggest-input"
      aria-label="Suggestion results"
      className={cm(
        "transition-opacity md:rounded-b md:border md:border-t-white md:border-gray-300 bg-white overflow-y-auto suggest-result md:shadow-xl max-h-[70vh]"
        //open ? "opacity-100" : "opacity-0"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, idx) => (
        <SuggestSelector
          {...item}
          key={idx}
          selected={idx == selectedIndex}
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

const SuggestedProduct = (
  item: SuggestedProduct & { index: number; selected: boolean }
) => {
  const { id, title, img, values, stock, stockLevel } = item;
  const { track } = useTracking();
  const navigate = useNavigate();
  return (
    <ItemContainer
      as="button"
      selected={item.selected}
      onClick={() => {
        track({ type: "click", item: toEcomTrackingEvent(item, item.index) });
        navigate(`/product/${id}`);
      }}
      className="items-center relative"
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

        {values?.["10"] == "Outlet" && values?.["20"] != null && (
          <em className="block text-xs text-gray-500 italic">{values["20"]}</em>
        )}
        {values?.["9"] != null && values?.["9"] != "Elgiganten" && (
          <em className="block text-xs text-gray-500 italic">
            Säljs av: {values["9"]}
          </em>
        )}
      </div>
    </ItemContainer>
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

const FlatRefinement = ({
  facetId,
  facetName,
  values,
  selected,
}: QueryRefinement & { selected: boolean }) => {
  const { setQuery } = useQuery();
  const { value } = values[0];
  return (
    <ItemContainer
      as="button"
      selected={selected}
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
  selected,
}: QueryRefinement & { selected: boolean }) => {
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
    <ItemContainer
      as="button"
      selected={selected}
      className="items-center"
      onClick={() => {
        const first = items?.[0];

        setQuery({
          query,
          string: first != null ? [{ id: facetId, value: [first.value] }] : [],
        });
      }}
    >
      <Lightbulb className="size-5 shrink-0" />
      <span>{query}</span> i
      <div className="flex gap-2 flex-nowrap overflow-x-auto items-center flex-1">
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
    </ItemContainer>
  );
};

const ItemContainer = <T extends keyof HTMLElementTagNameMap>({
  children,
  selected,
  as,
  className,
  ...props
}: {
  selected: boolean;
  children: ReactNode[];
  as: T;
} & Omit<HTMLAttributes<T>, "children">) => {
  return createElement(
    as,
    {
      ...props,
      className: cm(
        "p-2 flex gap-2 cursor-pointer w-full text-left",
        className,
        selected ? "bg-blue-200 hover:bg-blue-400" : "hover:bg-gray-100"
      ),
      "aria-selected": selected,
    },
    children
  );
};

const SuggestedQuery = ({
  query,
  fields,
  selected,
}: SuggestQuery & { selected: boolean }) => {
  const { setQuery } = useQuery();
  // if (fields == null || fields.length === 0) {
  //   return null;
  // }
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
      selected={selected}
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

const SuggestSelector = (
  props: SuggestResultItem & { index: number; selected: boolean }
) => {
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
