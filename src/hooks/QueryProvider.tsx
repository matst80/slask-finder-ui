import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
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
import { facetQueryToHash, queryToHash, toQuery } from "./searchHooks";

type QueryContextType = {
  query: ItemsQuery;
  facets: Facet[];
  hits: Item[];
  totalHits: number;
  isLoading: boolean;
  isLoadingFacets: boolean;
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

const QueryContext = createContext({} as QueryContextType);
export const QueryProvider = ({
  initialQuery,
  children,
}: PropsWithChildren<{
  initialQuery?: ItemsQuery;
}>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFacets, setIsLoadingFacets] = useState(false);
  const [facetsKey, setFacetsKey] = useState<string | null>(null);
  const [itemsKey, setItemsKey] = useState<string | null>(null);
  const [facets, setFacets] = useState<Facet[]>([]);
  const [hits, setHits] = useState<Item[]>([]);
  const [totalHits, setTotalHits] = useState<number>(0);
  const [query, setQuery] = useState<ItemsQuery>(
    initialQuery ?? {
      page: 0,
      pageSize: 20,
      range: [],
      //query: "*",
      sort: "popular",
      string: [],
      stock: [],
    }
  );
  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  }, []);
  const setPageSize = useCallback((pageSize: number) => {
    setQuery((prev) => ({ ...prev, pageSize }));
  }, []);
  const setSort = useCallback((sort: string) => {
    setPage(0);
    setQuery((prev) => ({ ...prev, sort }));
  }, []);
  const setStock = useCallback((stock: string[]) => {
    setPage(0);
    setQuery((prev) => ({ ...prev, stock }));
  }, []);
  const setTerm = useCallback((term: string) => {
    setPage(0);
    setQuery((prev) => ({ ...prev, query: term }));
  }, []);
  const removeFilter = useCallback((id: number) => {
    setPage(0);
    setQuery((prev) => ({
      ...prev,
      string: prev.string?.filter((f) => f.id !== id),
      range: prev.range?.filter((f) => f.id !== id),
    }));
  }, []);

  const setFilter = useCallback(
    (id: number, value: string[] | Omit<NumberField, "id">) => {
      setPage(0);
      if (isNumberValue(value)) {
        setQuery((prev) => ({
          ...prev,
          range: [
            ...(prev.range?.filter((r) => r.id !== id) ?? []),
            { id, ...value },
          ],
        }));
      } else {
        setQuery((prev) => ({
          ...prev,
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
    const facetKey = facetQueryToHash(query);
    const itemsKey = queryToHash(query);

    setTimeout(() => {
      setFacetsKey(facetKey);
    }, 50);
    setItemsKey(itemsKey);
  }, [query]);

  useEffect(() => {
    if (facetsKey == null) {
      return;
    }
    if (facetCache.has(facetsKey)) {
      setFacets(facetCache.get(facetsKey) ?? []);
    }
    console.log("facetsKey", facetsKey);
    setIsLoadingFacets(true);
    api.facets(toQuery(query)).then((data) => {
      facetCache.set(facetsKey, data);
      setFacets(data);
      setIsLoadingFacets(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facetsKey]);

  useEffect(() => {
    if (itemsKey == null) {
      return;
    }
    console.log("itemsKey", itemsKey);
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
      setFilter(id, Array.from(filter));
    },
    [id, filter, setFilter]
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
