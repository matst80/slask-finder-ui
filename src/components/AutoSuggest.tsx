import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Crosshair, Lightbulb, Search, SearchIcon } from "lucide-react";
import { cm, makeImageUrl } from "../utils";
import { Link } from "react-router-dom";
import { useQuery } from "../lib/hooks/useQuery";
import { ResultItem, StockIndicator } from "./ResultItem";
import { useSuggestions } from "../lib/hooks/useSuggestions";
import { trackClick } from "../lib/datalayer/beacons";
import { CmsPicture } from "../lib/types";
import { PriceValue } from "./Price";
import { MIN_FUZZY_SCORE } from "../lib/hooks/SuggestionProvider";
import fuzzysort from "fuzzysort";
import { ConvertedFacet, SuggestQuery } from "../lib/hooks/suggestionUtils";
import { useCursorPosition } from "./useCursorPosition";
import type {
  QueryRefinement,
  SuggestedContent,
  SuggestedProduct,
  SuggestResultItem,
} from "../lib/hooks/suggestionContext";

const byCategoryLevel = (
  a: { categoryLevel?: number },
  b: { categoryLevel?: number }
) => {
  if (a.categoryLevel == null || b.categoryLevel == null) {
    return 0;
  }
  return b.categoryLevel - a.categoryLevel;
};

// const byMatch =
//   (query?: string | null) =>
//   (a: { value: string; hits: number }, b: { value: string; hits: number }) => {
//     if (query == null) {
//       return b.hits - a.hits;
//     }
//     const aMatch = a.value.toLowerCase().includes(query.toLowerCase());
//     const bMatch = b.value.toLowerCase().includes(query.toLowerCase());

//     if (aMatch && !bMatch) {
//       return -1;
//     } else if (!aMatch && bMatch) {
//       return 1;
//     }
//     return b.hits - a.hits;
//   };

const byBestHits = (a: ConvertedFacet, b: ConvertedFacet) => {
  return b.values[0].hits - a.values[0].hits;
};

const flatFacetIds = [2];

// const MatchingFacets = () => {
//   const { facets, value: query } = useSuggestions();
//   const { setQuery } = useQuery();
//   const [flat, other] = useMemo(() => {
//     const [a, c] = facets
//       .filter(
//         (f) =>
//           (f.valueType != null && f.valueType != "") ||
//           (f.categoryLevel != null && f.categoryLevel > 0)
//       )
//       .reduce(
//         ([flat, rest], f) => {
//           if (
//             (f.categoryLevel != null && f.categoryLevel > 0) ||
//             flatFacetIds.includes(f.id)
//           ) {
//             return [[...flat, f], rest];
//           }

//           return [flat, [...rest, f]];
//         },
//         [[], []] as [typeof facets, typeof facets]
//       );
//     return [
//       a.sort(byCategoryLevel).flatMap(({ id, values, name, categoryLevel }) =>
//         values.map((value) => ({
//           ...value,
//           id,
//           name,
//           categoryLevel,
//         }))
//       ),
//       c.sort(byBestHits),
//     ];
//   }, [facets]);

//   const sortedFlat = useMemo(
//     () =>
//       fuzzysort
//         .go(query ?? "", flat, {
//           limit: 10,
//           threshold: 0.5,
//           keys: ["value"],
//         })
//         .map((d) => d.obj),

//     [flat, query]
//   );

//   const updateQuery = (value: string, id: number) => () => {
//     setQuery({
//       string: [{ id, value: [value] }],
//       query:
//         query != null && value.toLowerCase().includes(query.toLowerCase())
//           ? undefined
//           : query ?? undefined,
//       stock: [],
//       page: 0,
//     });
//   };

//   const setFlat = (value: string, id: number) => () => {
//     setQuery({
//       string: [{ id, value: [value] }],
//       query: undefined,
//       stock: [],
//       page: 0,
//     });
//   };

//   return other.length ? (
//     <SuggestionSection title="Förslag">
//       {sortedFlat.map(({ value, id, name }) => (
//         <button
//           key={value}
//           className="text-left flex items-center gap-2"
//           onClick={setFlat(value, id)}
//         >
//           <Crosshair className="size-5" />
//           <span>
//             {name}: {value}
//           </span>
//           {/* <span className="ml-2 inline-flex items-center justify-center px-2 py-1 rounded-full bg-white text-xs">
//                 {hits}
//               </span> */}
//         </button>
//       ))}

//       {other.map((f) => (
//         <div key={f.id} className="flex gap-2 items-center">
//           <Lightbulb className="size-5" />
//           <span>{f.name}</span>
//           <div className="flex gap-2 flex-nowrap overflow-x-auto">
//             {f.values.map(({ value }) => (
//               <button
//                 key={value}
//                 className="shrink-0 border line-clamp-1 text-ellipsis border-gray-200 bg-gray-100/50 hover:bg-gray-100/20 px-2 py-1 text-xs rounded-md z-20 flex gap-2 items-center"
//                 onClick={updateQuery(value, f.id)}
//               >
//                 {value}
//                 {/* <span className="ml-2 inline-flex items-center justify-center px-1 h-4 rounded-full bg-blue-200 text-blue-500">
//                   {hits}
//                 </span> */}
//               </button>
//             ))}
//           </div>
//         </div>
//       ))}
//     </SuggestionSection>
//   ) : null;
// };

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
        className="relative flex-1"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <input
          ref={inputRef}
          className="w-full pl-10 pr-4 py-2 transition-all border border-gray-300 rounded-md focus:outline-hidden"
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
        className="w-10 h-10 object-contain aspect-square"
      />
      <div className="flex flex-col flex-1">
        <span>{title}</span>
        {values["10"] == "Outlet" && values["20"] != null && (
          <em className="block text-xs text-gray-500 italic">{values["20"]}</em>
        )}
        {values["9"] != null && values["9"] != "Elgiganten" && (
          <em className="block text-xs text-gray-500 italic">
            Säljs av: {values["9"]}
          </em>
        )}
      </div>
      <div className="hidden md:block">
        <StockIndicator stock={stock} stockLevel={stockLevel} showOnlyInstock />
      </div>
      <span className="font-bold text-lg justify-end">
        <PriceValue value={values[4]} />
      </span>
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
const Refinement = ({
  values,
  facetName,
  facetId,
  flat,
  query,
}: QueryRefinement) => {
  const { value } = useSuggestions();
  const { setQuery } = useQuery();
  const updateQuery = (value: string) => () => {
    setQuery({
      string: [{ id: facetId, value: [value] }],
      query: flat ? undefined : query,
      stock: [],
      page: 0,
    });
  };
  return (
    <div className="p-2 hover:bg-gray-100 flex gap-2 cursor-pointer items-center w-full">
      <Lightbulb className="size-5" />
      <span>{value}</span>
      <div className="flex gap-2 flex-nowrap overflow-x-auto">
        {facetName}:
        {values.map(({ value, hits }) => (
          <button
            key={value}
            className="shrink-0 border line-clamp-1 text-ellipsis border-gray-200 bg-gray-100/50 hover:bg-gray-100/20 px-2 py-1 text-xs rounded-md z-20 flex gap-2 items-center"
            onClick={updateQuery(value)}
          >
            {value}
            <span className="ml-2 inline-flex items-center justify-center px-1 h-4 rounded-full bg-blue-200 text-blue-500">
              {hits}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
const SuggestedQuery = ({ query, fields, popularity }: SuggestQuery) => {
  const { setQuery } = useQuery();
  const updateQuery = (id: number, value: string) => () => {
    setQuery((prev) => ({
      ...prev,
      string: [{ id, value: [value] }],
      query: undefined,
      stock: [],
      page: 0,
    }));
  };
  return (
    <div className="p-2 hover:bg-gray-100 flex gap-2 cursor-pointer items-center w-full">
      <Lightbulb className="size-5" />
      <span>{query}</span>
      <div className="flex gap-2 flex-nowrap overflow-x-auto">
        {fields.map(({ id, name, values }) => {
          const { value } = values[0];
          return (
            <button
              key={id}
              className="shrink-0 border line-clamp-1 text-ellipsis border-gray-200 bg-gray-100/50 hover:bg-gray-100/20 px-2 py-1 text-xs rounded-md z-20 flex gap-2 items-center"
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
    </div>
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
      return <Refinement {...props} />;
    case "query":
      return <SuggestedQuery {...props} />;
    default:
      return null;
  }
};

const SuggestionResults = ({ open }: { open: boolean }) => {
  const { setQuery } = useQuery();
  const { items } = useSuggestions();
  return (
    <div
      className={cm(
        "transition-all absolute rounded-md border border-gray-300 block top-13 left-0 right-0 bg-white overflow-y-auto pt-1",
        open
          ? "shadow-xl max-h-[70vh] animate-suggestbox"
          : "shadow-none max-h-0 opacity-0"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map(({ type, ...item }) => (
        <SuggestSelector type={type} {...item} />
      ))}
      {/* {popularQueries != null && popularQueries.length > 0 && (
        <SuggestionSection title="Populära sökningar">
          {popularQueries.slice(undefined, 5).map(({ query, fields }) => (
            <button
              key={query}
              className="flex gap-2 items-center text-left"
              onClick={() => {
                setQuery((prev) => ({
                  ...prev,
                  query,
                  string: fields.slice(undefined, 1).map(({ values, id }) => ({
                    id,
                    value: values.slice(undefined, 1).map((d) => d.value),
                  })),
                }));
              }}
            >
              <SearchIcon className="size-5" />
              <span>{query}</span>
              <div className="flex gap-2 text-xs">
                {fields.slice(undefined, 1).map(({ values, id, name }) => (
                  <div
                    key={id}
                    className="px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                  >
                    <span key={id}>{name} </span>
                    <span className="font-bold">
                      {values
                        .slice(undefined, 1)
                        .map((d) => d.value)
                        .join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </button>
          ))}
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
                  {i.values["10"] == "Outlet" && i.values["20"] != null && (
                    <em className="block text-xs text-gray-500 italic">
                      {i.values["20"]}
                    </em>
                  )}
                  {i.values["9"] != null && i.values["9"] != "Elgiganten" && (
                    <em className="block text-xs text-gray-500 italic">
                      Säljs av: {i.values["9"]}
                    </em>
                  )}
                </div>
                <div className="hidden md:block">
                  <StockIndicator
                    stock={i.stock}
                    stockLevel={i.stockLevel}
                    showOnlyInstock
                  />
                </div>
                <span className="font-bold text-lg justify-end">
                  <PriceValue value={i.values[4]} />
                </span>
              </Link>
            ))}
          </div>
        </SuggestionSection>
      )}
      <ContentHits /> */}
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

// const ContentHits = () => {
//   const { content } = useSuggestions();

//   return content?.length ? (
//     <div className="overflow-x-auto max-w-full">
//       <div className="flex flex-nowrap">
//         {content.map(({ id, name, description, picture, url }) => (
//           <div key={id} className="p-2 shrink-0 w-[300px]">
//             <ParsedImage picture={picture} />
//             <h3 className="font-bold line-clamp-1 text-ellipsis">{name}</h3>
//             <p className="line-clamp-3 text-ellipsis">{description}</p>
//             <a
//               href={url}
//               className="text-blue-500 hover:underline"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               {name}
//             </a>
//           </div>
//         ))}
//       </div>
//     </div>
//   ) : null;
// };

// const SuggestionSection = ({
//   children,
//   title,
// }: PropsWithChildren<{ title: string }>) => {
//   return (
//     <div className="px-2 flex flex-col gap-2 border-b pb-2 mb-2 border-gray-100">
//       <h2 className="sr-only font-bold p-2">{title}:</h2>
//       {children}
//     </div>
//   );
// };
