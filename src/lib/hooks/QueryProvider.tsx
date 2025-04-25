import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import * as api from "../datalayer/api";
import {
  Facet,
  Item,
  ItemsQuery,
  isNumberValue,
  NumberField,
  HistoryQuery,
  KeyFacet,
  isKeyFacet,
} from "../types";
import {
  facetQueryToHash,
  queryFromHash,
  queryToHash,
  toQuery,
} from "../../hooks/searchHooks";
import { mergeFilters } from "./queryUtils";
import { QueryContext } from "./queryContext";

const facetCache = new Map<string, Facet[]>();
const itemsCache = new Map<string, Item[]>();

export type QueryProviderRef = {
  mergeQuery: (query: ItemsQuery) => void;
  setQuery: (query: ItemsQuery) => void;
};

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

const splitCategoryFacets = (facets: Facet[]): [KeyFacet[], Facet[]] => {
  return facets.reduce(
    ([c, all], facet) => {
      if (
        facet.categoryLevel != null &&
        facet.categoryLevel > 0 &&
        isKeyFacet(facet)
      ) {
        return [[...c, facet], all];
      }
      return [c, [...all, facet]];
    },
    [[] as KeyFacet[], [] as Facet[]]
  );
};

export const QueryProvider = ({
  initialQuery,
  children,
  ignoreFacets,
  loadFacets = true,
  ref,
}: PropsWithChildren<{
  initialQuery?: ItemsQuery;
  ignoreFacets?: number[];
  loadFacets?: boolean;
  ref?: React.Ref<QueryProviderRef>;
}>) => {
  const [queryHistory, setQueryHistory] = useState<HistoryQuery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFacets, setIsLoadingFacets] = useState(false);
  const [facetsKey, setFacetsKey] = useState<string | null>(null);
  const [itemsKey, setItemsKey] = useState<string | null>(null);
  const [facets, setFacets] = useState<Facet[]>([]);
  const [categoryFacets, setCategoryFacets] = useState<KeyFacet[]>([]);
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
      setQuery,
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
    const t = setTimeout(() => {
      setFacetsKey(facetQueryToHash(query));
    }, 50);

    setItemsKey(queryToHash(query));
    return () => {
      clearTimeout(t);
    };
  }, [query]);

  useEffect(() => {
    if (facetsKey == null || !loadFacets) {
      return;
    }
    if (facetCache.has(facetsKey)) {
      const cached = facetCache.get(facetsKey) ?? [];

      const [cat, other] = splitCategoryFacets(cached);
      setFacets(other);
      setCategoryFacets(cat);
    }

    setIsLoadingFacets(true);
    api.facets(toQuery(query, ignoreFacets)).then((data) => {
      facetCache.set(facetsKey, data);
      const [cat, other] = data.reduce(
        ([c, all], facet) => {
          if (
            facet.categoryLevel != null &&
            facet.categoryLevel > 0 &&
            isKeyFacet(facet)
          ) {
            return [[...c, facet], all];
          }
          return [c, [...all, facet]];
        },
        [[] as KeyFacet[], [] as Facet[]]
      );
      setFacets(other);
      setCategoryFacets(cat);
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
        categoryFacets,
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
