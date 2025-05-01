import useSWR from "swr";
import {
  facets,
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
import {
  FacetQuery,
  FilteringQuery,
  ItemsQuery,
  RelationGroup,
} from "../lib/types";
import { isDefined } from "../utils";

const FIELD_SEPARATOR = ":";
const ID_VALUE_SEPARATOR = "=";

export const queryFromHash = (hash: string): ItemsQuery => {
  const hashData = Object.fromEntries(new URLSearchParams(hash).entries());
  const integer = (hashData.i as string | undefined)
    ?.split(FIELD_SEPARATOR)
    .map((i) => {
      const [id, range] = i.split(ID_VALUE_SEPARATOR);
      const [min, max] = range.split("-").map(Number);
      return { id: Number(id), min, max };
    });
  const number = (hashData.n as string | undefined)
    ?.split(FIELD_SEPARATOR)
    .map((n) => {
      const [id, range] = n.split(ID_VALUE_SEPARATOR);
      const [min, max] = range.split("-").map(Number);
      return { id: Number(id), min, max };
    });

  const range = [...(integer ?? []), ...(number ?? [])];

  const string = (hashData.s as string | undefined)
    ?.split(FIELD_SEPARATOR)
    .map((s) => {
      const [id, value] = s.split(ID_VALUE_SEPARATOR);
      return {
        id: Number(id),
        value: value.includes("||") ? value.split("||") : [value],
      };
    });
  const query = hashData.q;
  const stock = hashData.stock?.split(FIELD_SEPARATOR) ?? [];
  const sort = hashData.sort ?? "popular";
  let page = Number(hashData.page) ?? 0;
  let pageSize = Number(hashData.size) ?? 40;
  if (isNaN(pageSize)) {
    pageSize = 40;
  }
  if (isNaN(page)) {
    page = 0;
  }
  return { range, sort, page, pageSize, query, stock, string };
};

export const queryToHash = ({
  range,
  sort,
  page,
  pageSize,
  query,
  stock,
  string,
}: ItemsQuery): string => {
  const filterObj = filteringQueryToHash({
    range,
    stock,
    query,
    string,
  });
  if (sort != null && sort !== "popular") {
    filterObj.sort = sort;
  }
  if (page != null) {
    filterObj.page = page.toString();
  }
  if (pageSize != null && pageSize !== 40) {
    filterObj.size = pageSize.toString();
  }
  return new URLSearchParams(filterObj).toString();
};

export const filteringQueryToHash = ({
  range,
  string,
  query,
  stock,
}: FilteringQuery): Record<string, string> => {
  const result: Record<string, string> = {};
  if (stock != null && stock.length > 0) {
    result.stock = stock.join(FIELD_SEPARATOR);
  }
  if (query != null && query.length > 0) {
    result.q = query;
  }
  const ints =
    range?.map(({ id, min, max }) => {
      return `${id}${ID_VALUE_SEPARATOR}${min}-${max}`;
    }) ?? [];
  if (ints.length > 0) {
    result.i = ints.join(FIELD_SEPARATOR);
  }

  // const nums =
  //   number?.map(({ id, min, max }) => {
  //     return `${id}${ID_VALUE_SEPARATOR}${min}-${max}`;
  //   }) ?? [];
  // if (nums.length > 0) {
  //   result.n = nums.join(FIELD_SEPARATOR);
  // }

  const strs =
    string?.map(({ id, value }) => {
      if (Array.isArray(value) && value.length === 0) {
        // console.log("Empty value for id:", id);
        return undefined;
      }
      return `${id}${ID_VALUE_SEPARATOR}${
        Array.isArray(value) ? value.join("||") : value
      }`;
    }) ?? [];
  if (strs.length) {
    result.s = strs.filter(isDefined).join(FIELD_SEPARATOR);
  }
  return result;
};

export const facetQueryToHash = ({
  range,
  query,
  stock,
  string,
}: FacetQuery): string => {
  const obj = filteringQueryToHash({ range, stock, string, query });
  return new URLSearchParams(obj).toString();
};

const itemsKey = (data: ItemsQuery) => `items-` + queryToHash(data);

const facetsKey = (data: FacetQuery) => "facets-" + facetQueryToHash(data);

export const toQuery = (data: ItemsQuery, ignoredFacets?: number[]): string => {
  const { range, sort, page, pageSize, query, stock, string } = data;

  const result = new URLSearchParams({
    page: (page ?? 0).toString(),
    size: (pageSize ?? 40)?.toString(),
    sort: sort ?? "popular",
    query: query ?? "",
  });
  range?.forEach(({ id, min, max }) => {
    result.append("rng", `${id}:${min}-${max}`);
  });

  if (ignoredFacets != null && ignoredFacets.length > 0) {
    ignoredFacets.forEach((value) => result.append("sf", String(value)));
  }

  string
    ?.filter(({ value }) => Array.isArray(value) && value.length > 0)
    .forEach(({ id, value }) => {
      result.append(
        "str",
        `${id}:${Array.isArray(value) ? value.join("||") : value}`
      );
    });
  stock?.forEach((s) => {
    result.append("stock", s);
  });

  return result.toString();
};

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

export const useFacets = (data: FacetQuery) => {
  return useSWR(facetsKey(data), () => facets(toQuery(data)), {
    keepPreviousData: true,
    revalidateOnFocus: false,
    refreshInterval: 0,
  });
};

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
    focusThrottleInterval: 3600,
  });
};

const getKey = (group: RelationGroup) => {
  return (
    group.groupId +
    group.requiredForItem.map((r) => `${r.facetId}+${r.value}`).join(",")
  );
};

export const useRelationGroups = () => {
  return useSWR(
    "relationGroups",
    () =>
      getRelations().then((data) =>
        data.map((d) => ({
          ...d,
          key: getKey(d),
        }))
      ),
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      focusThrottleInterval: 3600,
    }
  );
};

export const useAdminRelationGroups = () => {
  return useSWR(
    "admin-relationGroups",
    () =>
      getAdminRelations().then((data) =>
        data.map((d) => ({
          ...d,
          key: getKey(d),
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

export const useCompatibleItems = (id: number) => {
  return useSWR(`compatible-items-${id}`, () => getCompatible(id), {
    revalidateOnFocus: false,
    refreshInterval: 0,
    focusThrottleInterval: 3600,
  });
};

export const useYourPopularItems = () => {
  return useSWR("your-popular-items", () => getYourPopularItems(), {
    revalidateOnFocus: false,
    refreshInterval: 0,
    focusThrottleInterval: 3600,
  });
};
