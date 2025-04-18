import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import * as api from "../datalayer/api";
import {
  Facet,
  isNumberFacet,
  Item,
  ItemsQuery,
  isNumberValue,
  NumberField,
} from "../types";
import {
  facetQueryToHash,
  queryFromHash,
  queryToHash,
  toQuery,
} from "../../hooks/searchHooks";

type QueryContextType = {
  query: ItemsQuery;
  facets: Facet[];
  hits: Item[];
  totalHits: number;
  isLoading: boolean;
  isLoadingFacets: boolean;
  queryHistory: HistoryQuery[];
  setQuery: React.Dispatch<React.SetStateAction<ItemsQuery>>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (sort: string) => void;
  setStock: (stock: string[]) => void;
  setTerm: (term: string) => void;
  removeFilter: (id: number) => void;
  setFilter: (id: number, value: string[] | Omit<NumberField, "id">) => void;
};

const facetCache = new Map<string, Facet[]>();
const itemsCache = new Map<string, Item[]>();

export type QueryProviderRef = {
  mergeQuery: (query: ItemsQuery) => void;
  setQuery: (query: ItemsQuery) => void;
};

export const mergeFilters = (
  a: Pick<ItemsQuery, "string" | "range">,
  b: Pick<ItemsQuery, "string" | "range">
): Pick<ItemsQuery, "string" | "range"> => {
  const string = [
    ...(a.string ?? []).filter((f) => !b.string?.some((s) => s.id === f.id)),
    ...(b.string ?? []),
  ];
  const range = [
    ...(a.range ?? []).filter((r) => !b.range?.some((s) => s.id === r.id)),
    ...(b.range ?? []),
  ];
  return { string, range };
};

type HistoryQuery = ItemsQuery & { key: string };

const loadQueryFromHash = (): ItemsQuery => {
  const hash = window.location.hash.substring(1);
  if (!hash) {
    return {
      page: 0,
      pageSize: 20,
      range: [],
      //query: "*",
      sort: "popular",
      string: [],
      stock: [],
    };
  }
  return queryFromHash(hash);
};

const QueryContext = createContext({} as QueryContextType);
export const QueryProvider = ({
  initialQuery,
  children,
  loadFacets = true,
  ref,
}: PropsWithChildren<{
  initialQuery?: ItemsQuery;
  loadFacets?: boolean;
  ref?: React.Ref<QueryProviderRef>;
}>) => {
  const [queryHistory, setQueryHistory] = useState<HistoryQuery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFacets, setIsLoadingFacets] = useState(false);
  const [facetsKey, setFacetsKey] = useState<string | null>(null);
  const [itemsKey, setItemsKey] = useState<string | null>(null);
  const [facets, setFacets] = useState<Facet[]>([]);
  const [hits, setHits] = useState<Item[]>([]);
  const [totalHits, setTotalHits] = useState<number>(0);
  const [query, setQuery] = useState<ItemsQuery>(
    initialQuery ?? loadQueryFromHash()
  );
  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  }, []);
  const setPageSize = useCallback((pageSize: number) => {
    setQuery((prev) => ({ ...prev, pageSize }));
  }, []);
  const setSort = useCallback((sort: string) => {
    setQuery((prev) => ({ ...prev, sort, page: 0 }));
  }, []);
  const setStock = useCallback((stock: string[]) => {
    setQuery((prev) => ({ ...prev, stock, page: 0 }));
  }, []);
  const setTerm = useCallback((term: string) => {
    setQuery((prev) => ({ ...prev, query: term, page: 0 }));
  }, []);
  const removeFilter = useCallback((id: number) => {
    setQuery((prev) => ({
      ...prev,
      string: prev.string?.filter((f) => f.id !== id),
      range: prev.range?.filter((f) => f.id !== id),
      page: 0,
    }));
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      mergeQuery: (query: ItemsQuery) => {
        setQuery((prev) => ({
          ...prev,
          ...mergeFilters(prev, query),
          page: 0,
        }));
      },
      setQuery: (query: ItemsQuery) => {
        setQuery(query);
      },
    }),
    []
  );

  const setFilter = useCallback(
    (id: number, value: string[] | Omit<NumberField, "id">) => {
      if (isNumberValue(value)) {
        setQuery((prev) => ({
          ...prev,
          page: 0,
          range: [
            ...(prev.range?.filter((r) => r.id !== id) ?? []),
            { id, ...value },
          ],
        }));
      } else {
        setQuery((prev) => ({
          ...prev,
          page: 0,
          string: [
            ...(prev.string?.filter((r) => r.id !== id) ?? []),
            { id, value },
          ],
        }));
      }
    },
    []
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setFacetsKey(facetQueryToHash(query));
    }, 50);

    setItemsKey(queryToHash(query));
    return () => {
      clearTimeout(t);
    };
  }, [query]);

  useEffect(() => {
    setQueryHistory((prev) => {
      const currentKey = facetQueryToHash(query);
      if (prev.some((d) => d.key === currentKey)) {
        return prev;
      }
      if (prev.length >= 10) {
        prev.shift();
      }
      return [...prev, { ...query, key: currentKey }];
    });
  }, [query]);

  useEffect(() => {
    if (facetsKey == null || !loadFacets) {
      return;
    }
    if (facetCache.has(facetsKey)) {
      setFacets(facetCache.get(facetsKey) ?? []);
    }

    setIsLoadingFacets(true);
    api.facets(toQuery(query)).then((data) => {
      facetCache.set(facetsKey, data);
      setFacets(data);
      setIsLoadingFacets(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facetsKey, loadFacets]);

  useEffect(() => {
    if (itemsKey == null) {
      return;
    }

    if (itemsCache.has(itemsKey)) {
      setHits(itemsCache.get(itemsKey) ?? []);
    }
    setIsLoading(true);
    api.streamItems(toQuery(query)).then((data) => {
      itemsCache.set(itemsKey, data?.items);
      setHits(data?.items);
      setQuery((prev) => ({
        ...prev,
        page: data?.page ?? prev.page,
        pageSize: data?.pageSize ?? prev.pageSize,
      }));
      setTotalHits(data?.totalHits ?? 0);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey]);

  return (
    <QueryContext.Provider
      value={{
        query,
        setQuery,
        setPage,
        setPageSize,
        setSort,
        setStock,
        queryHistory,
        setTerm,
        removeFilter,
        setFilter,
        isLoading,
        isLoadingFacets,
        facets,
        hits,
        totalHits,
      }}
    >
      {children}
    </QueryContext.Provider>
  );
};

export const useQuery = () => {
  const context = useContext(QueryContext);
  if (context === undefined) {
    throw new Error("useQuery must be used within a QueryProvider");
  }
  return context;
};

export const useQueryKeyFacet = (id: number) => {
  const {
    facets,
    query: { string: keys },
    setFilter,
    removeFilter,
  } = useQuery();
  const facet = useMemo(() => facets.find((f) => f.id === id), [facets, id]);
  const filter = useMemo(
    () => new Set(keys?.find((f) => f.id === id)?.value ?? []),
    [keys, id]
  );
  const updateValue = useCallback(
    (value: string[]) => {
      setFilter(id, value as string[]);
    },
    [id, setFilter]
  );
  const addValue = useCallback(
    (value: string) => {
      filter?.add(value);
      setFilter(id, Array.from(filter));
    },
    [id, filter, setFilter]
  );
  const removeValue = useCallback(
    (value: string) => {
      filter?.delete(value);
      if (filter?.size === 0) {
        removeFilter(id);
      } else {
        setFilter(id, Array.from(filter));
      }
    },
    [id, filter, setFilter, removeFilter]
  );

  return { facet, filter, updateValue, addValue, removeValue };
};

export const useQueryRangeFacet = (id: number) => {
  const {
    facets,
    query: { range },
    setFilter,
  } = useQuery();
  const facet = useMemo(
    () => facets.find((f) => isNumberFacet(f) && f.id === id),
    [facets, id]
  );
  const filter = useMemo(() => {
    const f = range?.find((f) => f.id === id);
    return f ? { min: f.min, max: f.max } : facet?.result;
  }, [range, id, facet]);
  const updateValue = useCallback(
    (value: Omit<NumberField, "id">) => {
      setFilter(id, value);
    },
    [id, setFilter]
  );

  return { facet, filter, updateValue };
};
