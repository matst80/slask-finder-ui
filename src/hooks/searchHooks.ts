"use client";
import useSWR from "swr";
import {
  getAdminRelations,
  getCompatible,
  getFacetGroups,
  getFacetList,
  getFacetMap,
  getRelated,
  getRelations,
  getYourPopularItems,
  streamItems,
} from "../lib/datalayer/api";
import { ItemsQuery, RelationGroup } from "../lib/types";
import { itemsKey, toQuery } from "./search-utils";

export const useItemsSearch = (query: ItemsQuery) => {
  return useSWR(
    itemsKey(query),
    () => {
      return streamItems(toQuery(query));
    },
    {
      keepPreviousData: true,
    }
  );
};

// const delay = <T>(fn: () => Promise<T>, ms: number): (() => Promise<T>) => {
//   return () =>
//     new Promise((resolve) => {
//       setTimeout(() => {
//         resolve(fn());
//       }, ms);
//     });
// };

// export const useFacets = (data: FacetQuery) => {
//   return useSWR(facetsKey(data), () => facets(toQuery(data)), {
//     keepPreviousData: true,
//     revalidateOnFocus: false,
//     refreshInterval: 0,
//   });
// };

// const getLocationHashData = (): ItemsQuery => {
//   const hash = globalThis.location.hash;
//   if (hash.length > 1) {
//     return queryFromHash(hash.substring(1));
//   }
//   return { stock: [], page: 0, pageSize: 40, sort: "popular" };
// };

// export const useHashQuery = () => {
//   const [query, setInternalQuery] = useState<ItemsQuery>(getLocationHashData());

//   useEffect(() => {
//     const onHashChange = () => {
//       setInternalQuery(getLocationHashData());
//     };
//     globalThis.window.addEventListener("hashchange", onHashChange);
//     return () =>
//       globalThis.window.removeEventListener("hashchange", onHashChange);
//   }, []);

//   const setQuery = useCallback(
//     (fn: (data: ItemsQuery) => ItemsQuery) => {
//       globalThis.location.hash = queryToHash(fn(query));
//     },
//     [query]
//   );

//   const partialUpdate = useCallback(
//     <T extends keyof ItemsQuery>(key: T) =>
//       (fnOrValue: FunctionOrValue<ItemsQuery[T]>) => {
//         setQuery((prev) => {
//           const value =
//             typeof fnOrValue === "function" ? fnOrValue(prev[key]) : fnOrValue;

//           if (key != "page") {
//             return { ...prev, [key]: value, page: 0 };
//           }
//           return { ...prev, [key]: value };
//         });
//       },
//     [setQuery]
//   );

//   return {
//     query,
//     partialUpdate,
//     setQuery,
//   };
// };

// export const useHashResultItems = () => {
//   const { query } = useHashQuery();
//   return useItemsSearch(query);
// };

// export const useHashFacets = () => {
//   const {
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     query: { sort, pageSize, page, ...facetQuery },
//   } = useHashQuery();
//   return useFacets(facetQuery);
// };

// type FunctionOrValue<T> = T | ((prev: T) => T);

// export const useQueryHelpers = () => {
//   const { query, partialUpdate, setQuery } = useHashQuery();

//   const setPage = partialUpdate("page");
//   const setPageSize = partialUpdate("pageSize");
//   const setSort = partialUpdate("sort");
//   const setStock = partialUpdate("stock");
//   const setTerm = partialUpdate("query");
//   const setKeyFilters = partialUpdate("string");
//   const setRangeFilters = partialUpdate("range");

//   const setGlobalTerm = (term: string) => {
//     setQuery((prev) => ({
//       ...prev,
//       string: [],
//       number: [],
//       integer: [],
//       query: term,
//     }));
//   };
//   return {
//     query,
//     setPage,
//     setGlobalTerm,
//     setPageSize,
//     setSort,
//     setStock,
//     setTerm,
//     setKeyFilters,
//     setRangeFilters,
//   };
// };

// export const useFilters = () => {
//   const { query, setKeyFilters, setRangeFilters } = useQueryHelpers();
//   return {
//     keyFilters: query.string ?? [],
//     addKeyFilter: (id: number, value: string) => {
//       setKeyFilters((prev) => {
//         if (!prev) {
//           return [{ id, value }];
//         }
//         const foundIdx = prev?.findIndex((f) => f.id === id);
//         if (foundIdx !== -1) {
//           const p = prev[foundIdx];
//           if (p.value === value) {
//             return prev;
//           } else {
//             prev[foundIdx].value = [
//               ...(Array.isArray(p.value) ? p.value : [p.value]),
//               value,
//             ];
//           }
//           return prev;
//         }
//         return [...prev, { id, value }];
//       });
//       //setPage(0);
//     },
//     removeKeyFilter: (id: number, value?: string) => {
//       setKeyFilters((prev) => {
//         if (!prev) {
//           return [];
//         }
//         const foundIdx = prev?.findIndex((f) => f.id === id);
//         if (foundIdx !== -1) {
//           const p = prev[foundIdx];
//           if (p.value === value) {
//             return [...prev].filter((f) => f.id !== id);
//           } else {
//             prev[foundIdx].value = [
//               ...(Array.isArray(p.value) ? p.value : [p.value]),
//             ].filter((v) => v !== value);
//           }
//           return prev;
//         }
//         return [...prev].filter((f) => f.id !== id);
//       });
//       //setPage(0);
//     },
//     numberFilters: query.range ?? [],
//     addNumberFilter: (id: number, min: number, max: number) => {
//       setRangeFilters((prev) => [...(prev ?? []), { id, min, max }]);
//       //setPage(0);
//     },
//     removeNumberFilter: (id: number) => {
//       setRangeFilters((prev) => [...(prev ?? [])].filter((f) => f.id !== id));
//       //setPage(0);
//     },
//   };
// };

export const useFacetMap = () => {
  return useSWR("facet-map", getFacetMap, {
    revalidateOnFocus: false,
    refreshInterval: 0,
    keepPreviousData: true,
    revalidateIfStale: false,
    focusThrottleInterval: 3600,
  });
};

const getKey = (group: RelationGroup, idx: number) => {
  return `${group.groupId}-${idx}`;
};

export const useRelationGroups = () => {
  return useSWR(
    "relationGroups",
    () =>
      getRelations().then((data) =>
        data.map((d, i) => ({
          ...d,
          key: getKey(d, i),
        }))
      ),
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      keepPreviousData: true,
      revalidateIfStale: false,
      focusThrottleInterval: 3600,
    }
  );
};

export const useAdminRelationGroups = () => {
  return useSWR(
    "admin-relationGroups",
    () =>
      getAdminRelations().then((data) =>
        data.map((d, i) => ({
          ...d,
          key: getKey(d, i),
        }))
      ),
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      focusThrottleInterval: 3600,
    }
  );
};

export const useFacetList = () => {
  return useSWR("facet-list", getFacetList, {
    revalidateOnFocus: false,
    refreshInterval: 0,
    focusThrottleInterval: 3600,
  });
};

export const useFacetGroups = () => {
  return useSWR("facet-groups", getFacetGroups, {
    revalidateOnFocus: false,
    refreshInterval: 0,
    focusThrottleInterval: 3600,
  });
};

export const useRelatedItems = (id: number) => {
  return useSWR(`related-items-${id}`, () => getRelated(id), {
    revalidateOnFocus: false,
    refreshInterval: 0,
    focusThrottleInterval: 3600,
  });
};

export const useCompatibleItems = (id: number, otherIds: number[]) => {
  return useSWR(
    `compatible-items-${id}-${otherIds?.join("-") ?? ""}`,
    () => getCompatible(id, otherIds),
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      focusThrottleInterval: 3600,
    }
  );
};

export const useYourPopularItems = () => {
  return useSWR("your-popular-items", () => getYourPopularItems(), {
    revalidateOnFocus: false,
    refreshInterval: 0,
    focusThrottleInterval: 3600,
  });
};
