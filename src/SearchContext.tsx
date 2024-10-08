// import {
//   createContext,
//   PropsWithChildren,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import { Item, ItemsQuery, FacetResult, Sort } from "./types";
// import { facets, streamItems } from "./api";
// import { remove } from "./utils";
// import { queryFromHash, queryToHash } from "./searchHooks";

// type KeyFilters = {
//   [key: number]: string | undefined;
// };

// type NumberFilters = {
//   [key: number]: { min: number; max: number } | undefined;
// };

// type SearchContextType = {
//   term: string;
//   sort?: Sort;
//   setSort: React.Dispatch<React.SetStateAction<Sort>>;
//   loadingFacets: boolean;
//   loadingItems: boolean;
//   setTerm: (term: string) => void;
//   page: number;
//   setPage: (page: number) => void;
//   pageSize: number;
//   results?: FacetResult;
//   setItems: (items: Item[]) => void;
//   keyFilters: KeyFilters;
//   locationId?: string;
//   setLocationId: React.Dispatch<React.SetStateAction<string | undefined>>;
//   setKeyFilters: React.Dispatch<React.SetStateAction<KeyFilters>>;
//   numberFilters: NumberFilters;
//   setNumberFilters: React.Dispatch<React.SetStateAction<NumberFilters>>;
//   integerFilters: NumberFilters;
//   setIntegerFilters: React.Dispatch<React.SetStateAction<NumberFilters>>;
// };

// const SearchContext = createContext<SearchContextType | null>(null);

// type KeyValue<T> = [string | number, T | undefined];
// type ValidKeyValue<T> = [string | number, NonNullable<T>];

// function hasValue<T>(data: KeyValue<T>): data is ValidKeyValue<T> {
//   return data[1] != null;
// }

// export const SearchContextProvider = ({
//   children,
//   pageSize,
// }: PropsWithChildren<{ pageSize: number }>) => {
//   const [term, setTerm] = useState("");
//   const [page, setPage] = useState(0);
//   const [sort, setSort] = useState<Sort>("popular");
//   const [loadingFacets, setLoadingFacets] = useState(false);
//   const [loadingItems, setLoadingItems] = useState(false);
//   const [locationId, setLocationId] = useState<string | undefined>(undefined);
//   const [keyFilters, setKeyFilters] = useState<KeyFilters>({});
//   const [numberFilters, setNumberFilters] = useState<NumberFilters>({});
//   const [integerFilters, setIntegerFilters] = useState<NumberFilters>({});
//   const [results, setResults] = useState<FacetResult | undefined>(undefined);

//   const setItems = useCallback(
//     (items: Item[]) => {
//       setResults((prev) => {
//         if (prev == null) {
//           return {
//             items: items,
//             totalHits: items.length,
//             pageSize: pageSize,
//           };
//         }
//         return {
//           ...prev,
//           items: items,
//         };
//       });
//     },
//     [pageSize],
//   );

//   const itemsQuery = useMemo(() => {
//     return { sort, page, pageSize };
//   }, [sort, page, pageSize]);
//   const query = useMemo(() => {
//     return {
//       query: term,
//       stock: locationId,
//       string: Object.entries(keyFilters)
//         .filter(hasValue)
//         .map(([id, value]) => ({
//           id: Number(id),
//           value: value!,
//         })),
//       number: Object.entries(numberFilters)
//         .filter(hasValue)
//         .map(([id, props]) => ({
//           id: Number(id),
//           ...props!,
//         })),
//       integer: Object.entries(integerFilters)
//         .filter(hasValue)
//         .map(([id, props]) => ({
//           id: Number(id),
//           ...props!,
//         })),
//     } satisfies ItemsQuery;
//   }, [term, keyFilters, numberFilters, integerFilters, locationId]);

//   useEffect(() => {
//     setLoadingFacets(true);
//     facets(query)
//       .then((data) => {
//         setResults((prev) => ({
//           items: prev?.items ?? [],
//           pageSize: prev?.pageSize ?? 0,
//           ...prev,
//           ...data,
//         }));
//         // if (data?.items.length > 0 && numberOfItems) {
//         //   setTimeout(() => {
//         //     document.getElementById("results")?.scrollIntoView({
//         //       behavior: "smooth",
//         //       block: "start",
//         //       inline: "start",
//         //     });
//         //   }, 200);
//         // }
//       })
//       .finally(() => setLoadingFacets(false));
//   }, [query]);
//   useEffect(() => {
//     const onHashChange = (e: unknown) => {
//       console.log(e);
//       const hash = globalThis.location.hash;
//       if (hash.length > 1) {
//         console.log(queryFromHash(hash.substring(1)));
//       }
//     };
//     globalThis.window.addEventListener("hashchange", onHashChange);
//     return () =>
//       globalThis.window.removeEventListener("hashchange", onHashChange);
//   }, []);
//   useEffect(() => {
//     const hash = queryToHash({ ...query, ...itemsQuery });
//     globalThis.location.hash = hash;
//     setItems([]);
//     setLoadingItems(true);
//     streamItems({ ...query, ...itemsQuery })
//       .then((data) => {
//         setItems(data);
//       })
//       .finally(() => setLoadingItems(false));
//   }, [query, itemsQuery, setItems]);
//   return (
//     <SearchContext.Provider
//       value={{
//         term,
//         setTerm,
//         page,
//         setPage,
//         sort,
//         setSort,
//         locationId,
//         loadingItems,
//         loadingFacets,
//         setLocationId,
//         pageSize,
//         setItems,
//         results,
//         keyFilters,
//         setKeyFilters,
//         numberFilters,
//         setNumberFilters,
//         integerFilters,
//         setIntegerFilters,
//       }}
//     >
//       {children}
//     </SearchContext.Provider>
//   );
// };

// export const useSearchContext = () => {
//   const context = useContext(SearchContext);
//   if (context == null) {
//     throw new Error(
//       "useSearchContext must be used within a SearchContextProvider",
//     );
//   }
//   return context;
// };

// export const useFilters = () => {
//   const {
//     setPage,
//     keyFilters,
//     setKeyFilters,
//     numberFilters,
//     setNumberFilters,
//     integerFilters,
//     setIntegerFilters,
//   } = useSearchContext();
//   return {
//     keyFilters,
//     addKeyFilter: (key: number, value: string) => {
//       setKeyFilters((prev) => ({ ...prev, [key]: value }));
//       setPage(0);
//     },
//     removeKeyFilter: (key: number) => {
//       setKeyFilters(remove(key));
//       setPage(0);
//     },
//     numberFilters,
//     addNumberFilter: (key: number, min: number, max: number) => {
//       setNumberFilters((prev) => ({ ...prev, [key]: { min, max } }));
//       setPage(0);
//     },
//     removeNumberFilter: (key: number) => {
//       setNumberFilters(remove(key));
//       setPage(0);
//     },
//     integerFilters,
//     addIntegerFilter: (key: number, min: number, max: number) => {
//       setIntegerFilters((prev) => ({ ...prev, [key]: { min, max } }));
//       setPage(0);
//     },
//     removeIntegerFilter: (key: number) => {
//       setIntegerFilters(remove(key));
//       setPage(0);
//     },
//   };
// };
