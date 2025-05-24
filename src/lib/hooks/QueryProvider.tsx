"use client";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import * as api from "../datalayer/api";
import {
  Item,
  ItemsQuery,
  isNumberValue,
  NumberField,
  HistoryQuery,
} from "../types";
import {
  facetQueryToHash,
  queryFromHash,
  queryToHash,
  toQuery,
} from "../../hooks/searchHooks";
import { mergeFilters } from "./queryUtils";
import { AddPageResult, QueryContext } from "./queryContext";

const itemsCache = new Map<string, Item[]>();

export type QueryProviderRef = {
  mergeQuery: (query: ItemsQuery) => void;
  setQuery: (query: ItemsQuery) => void;
};

const loadQueryFromHash = (): ItemsQuery => {
  const hash = globalThis.location?.hash.substring(1);
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

export const QueryProvider = ({
  initialQuery,
  children,
  attachToHash = false,
  ref,
}: PropsWithChildren<{
  initialQuery?: ItemsQuery;
  attachToHash?: boolean;
  ref?: React.Ref<QueryProviderRef>;
}>) => {
  const [virtualPage, setVirtualPage] = useState(0);
  const [queryHistory, setQueryHistory] = useState<HistoryQuery[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [itemsKey, setItemsKey] = useState<string | null>(null);

  const [hits, setHits] = useState<Item[]>([]);
  const [totalHits, setTotalHits] = useState<number>(0);
  const [query, setQuery] = useState<ItemsQuery>(
    initialQuery ?? (attachToHash ? loadQueryFromHash() : {})
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
    (
      globalThis.window as Window & { selectedStoreId?: string }
    ).selectedStoreId = stock[0];
    setQuery(({ filter, ...prev }) => ({ ...prev, stock, page: 0 }));
  }, []);
  const setTerm = useCallback((term: string) => {
    setQuery(({ filter, ...prev }) => ({ ...prev, query: term, page: 0 }));
  }, []);
  const removeFilter = useCallback((id: number) => {
    setQuery(({ filter, ...prev }) => ({
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
        setQuery(({ filter, ...prev }) => ({
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
        setQuery(({ filter, ...prev }) => ({
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

  const setFilterTerm = useCallback(
    (filter: string) => {
      setQuery((prev) => ({
        ...prev,
        page: 0,
        filter,
      }));
    },
    [setQuery]
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

    setVirtualPage(query.page ?? 0);

    setItemsKey(queryToHash(query));
  }, [query]);

  const addPage = useCallback(() => {
    const virtualQuery = { ...query, page: virtualPage + 1 };

    const virtualKey = queryToHash(virtualQuery);
    return api
      .streamItems(toQuery(virtualQuery))
      .then((data): AddPageResult => {
        if (data?.items == null) {
          return {
            currentPage: virtualPage,
            hasMorePages: false,
            totalPages: virtualPage,
          };
        }

        itemsCache.set(virtualKey, data.items);
        setVirtualPage(data.page);
        setHits((prev) => [...prev, ...data.items]);
        return {
          currentPage: data.page,
          hasMorePages:
            data.page < (data.totalHits ?? 0) / (data.pageSize ?? 20),
          totalPages: Math.ceil((data.totalHits ?? 0) / (data.pageSize ?? 20)),
        };
      });
  }, [query, virtualPage]);
  useEffect(() => {
    if (!attachToHash) {
      return;
    }
    const hashListener = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        setQuery(queryFromHash(hash));
      } else {
        setQuery(initialQuery ?? {});
      }
    };
    addEventListener("hashchange", hashListener, false);
    return () => {
      removeEventListener("hashchange", hashListener, false);
    };
  }, [attachToHash]);

  useEffect(() => {
    if (itemsKey == null) {
      return;
    }
    if (itemsKey === "page=0&size=20") {
      return;
    }
    if (attachToHash) {
      if (itemsKey !== window.location.hash.substring(1)) {
        window.history.pushState(null, "hash", `#${itemsKey}`);
      }
    }
    //window.location.hash = itemsKey;

    if (itemsCache.has(itemsKey)) {
      setHits(itemsCache.get(itemsKey) ?? []);
    }

    setIsLoading(true);

    api.streamItems(toQuery(query)).then((data) => {
      itemsCache.set(itemsKey, data?.items);
      setHits(data?.items ?? []);
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
        addPage,
        queryHistory,
        setFilterTerm,
        setTerm,
        removeFilter,
        setFilter,
        isLoading,

        hits,
        totalHits,
      }}
    >
      {children}
    </QueryContext.Provider>
  );
};
