import useSWR from "swr";
import {
  facets,
  getFacetList,
  getRelated,
  streamItems,
} from "../datalayer/api";
import { FacetQuery, FilteringQuery, ItemsQuery } from "../types";
import { useEffect, useState, useCallback } from "react";

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

  const range = [...integer??[], ...number??[]];

  const string = (hashData.s as string | undefined)
    ?.split(FIELD_SEPARATOR)
    .map((s) => {
      const [id, value] = s.split(ID_VALUE_SEPARATOR);
      return { id: Number(id), value };
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
      return `${id}${ID_VALUE_SEPARATOR}${value}`;
    }) ?? [];
  if (strs.length) {
    result.s = strs.join(FIELD_SEPARATOR);
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

const toQuery = (data: ItemsQuery): string => {
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
  
  string?.forEach(({ id, value }) => {
    result.append("str", `${id}:${value}`);
  });
  stock.forEach((s) => {
    result.append("stock", s);
  });

  return result.toString();
};

export const useItemsSearch = (query: ItemsQuery) => {
  return useSWR(itemsKey(query), () => streamItems(toQuery(query)), {
    keepPreviousData: true,
  });
};

const delay = <T>(fn: () => Promise<T>, ms: number): (() => Promise<T>) => {
  return () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(fn());
      }, ms);
    });
};

export const useFacets = (data: FacetQuery) => {
  return useSWR(
    facetsKey(data),
    delay(() => facets(toQuery(data)), 80),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      refreshInterval: 0,
    }
  );
};

const getLocationHashData = (): ItemsQuery => {
  const hash = globalThis.location.hash;
  if (hash.length > 1) {
    return queryFromHash(hash.substring(1));
  }
  return { stock: [], page: 0, pageSize: 40, sort: "popular" };
};

export const useHashQuery = () => {
  const [query, setInternalQuery] = useState<ItemsQuery>(getLocationHashData());

  useEffect(() => {
    const onHashChange = () => {
      setInternalQuery(getLocationHashData());
    };
    globalThis.window.addEventListener("hashchange", onHashChange);
    return () =>
      globalThis.window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setQuery = useCallback(
    (fn: (data: ItemsQuery) => ItemsQuery) => {
      globalThis.location.hash = queryToHash(fn(query));
    },
    [query]
  );

  const partialUpdate = useCallback(
    <T extends keyof ItemsQuery>(key: T) =>
      (fnOrValue: FunctionOrValue<ItemsQuery[T]>) => {
        setQuery((prev) => {
          const value =
            typeof fnOrValue === "function" ? fnOrValue(prev[key]) : fnOrValue;

          if (key != "page") {
            return { ...prev, [key]: value, page: 0 };
          }
          return { ...prev, [key]: value };
        });
      },
    [setQuery]
  );

  return {
    query,
    partialUpdate,
    setQuery,
  };
};

export const useHashResultItems = () => {
  const { query } = useHashQuery();
  return useItemsSearch(query);
};

export const useHashFacets = () => {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    query: { sort, pageSize, page, ...facetQuery },
  } = useHashQuery();
  return useFacets(facetQuery);
};

type FunctionOrValue<T> = T | ((prev: T) => T);

export const useQueryHelpers = () => {
  const { query, partialUpdate } = useHashQuery();

  const setPage = partialUpdate("page");
  const setPageSize = partialUpdate("pageSize");
  const setSort = partialUpdate("sort");
  const setStock = partialUpdate("stock");
  const setTerm = partialUpdate("query");
  const setKeyFilters = partialUpdate("string");
  const setNumberFilters = partialUpdate("range");
  
  return {
    query,
    setPage,
    setPageSize,
    setSort,
    setStock,
    setTerm,
    setKeyFilters,
    setNumberFilters,
  
  };
};

export const useFilters = () => {
  const { query, setKeyFilters, setNumberFilters } =
    useQueryHelpers();
  return {
    keyFilters: query.string ?? [],
    addKeyFilter: (id: number, value: string) => {
      setKeyFilters((prev) => [...(prev ?? []), { id, value }]);
      //setPage(0);
    },
    removeKeyFilter: (id: number) => {
      setKeyFilters((prev) => [...(prev ?? [])].filter((f) => f.id !== id));
      //setPage(0);
    },
    numberFilters: query.range ?? [],
    addNumberFilter: (id: number, min: number, max: number) => {
      setNumberFilters((prev) => [...(prev ?? []), { id, min, max }]);
      //setPage(0);
    },
    removeNumberFilter: (id: number) => {
      setNumberFilters((prev) => [...(prev ?? [])].filter((f) => f.id !== id));
      //setPage(0);
    },
  };
};

export const useFacetList = () => {
  return useSWR("facet-list", getFacetList, {
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
