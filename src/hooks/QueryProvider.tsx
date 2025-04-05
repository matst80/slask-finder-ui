import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as api from "../datalayer/api";
import { Facet, Item, ItemsQuery } from "../types";
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
      query: "*",
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
    setQuery((prev) => ({ ...prev, sort }));
  }, []);
  const setStock = useCallback((stock: string[]) => {
    setQuery((prev) => ({ ...prev, stock }));
  }, []);
  const setTerm = useCallback((term: string) => {
    setQuery((prev) => ({ ...prev, query: term }));
  }, []);

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
