import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { fromQueryString, toQuery } from '../../hooks/searchHooks'
import * as api from '../datalayer/api'
import {
  HistoryQuery,
  Item,
  ItemsQuery,
  isNumberValue,
  NumberField,
} from '../types'
import { AddPageResult, QueryContext } from './queryContext'
import { mergeFilters } from './queryUtils'

const itemsCache = new Map<string, Item[]>()

export type QueryProviderRef = {
  mergeQuery: (query: ItemsQuery) => void
  setQuery: (query: ItemsQuery) => void
}

const loadQueryFromHash = (): ItemsQuery => {
  const hash = window.location.hash.substring(1)
  if (!hash) {
    return {
      page: 0,
      pageSize: 20,
      range: [],
      //query: "*",
      sort: 'popular',
      string: [],
      stock: [],
    }
  }
  return fromQueryString(hash)
}

export const QueryProvider = ({
  initialQuery,
  children,
  attachToHash = false,
  ref,
}: PropsWithChildren<{
  initialQuery?: ItemsQuery
  attachToHash?: boolean
  ref?: React.Ref<QueryProviderRef>
}>) => {
  const virtualPage = useRef(0)
  //const [virtualPage, setVirtualPage] = useState(0);
  const [queryHistory, setQueryHistory] = useState<HistoryQuery[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [itemsKey, setItemsKey] = useState<string | null>(null)

  const [hits, setHits] = useState<Item[]>([])
  const [totalHits, setTotalHits] = useState<number>(0)
  const [query, setQuery] = useState<ItemsQuery>(
    initialQuery ?? (attachToHash ? loadQueryFromHash() : {}),
  )
  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }))
  }, [])
  const setPageSize = useCallback((pageSize: number) => {
    setQuery((prev) => ({ ...prev, pageSize }))
  }, [])
  const setSort = useCallback((sort: string) => {
    setQuery((prev) => ({ ...prev, sort, page: 0 }))
  }, [])
  const setStock = useCallback((stock: string[]) => {
    ;(
      globalThis.window as Window & { selectedStoreId?: string }
    ).selectedStoreId = stock[0]
    setQuery(({ filter, ...prev }) => ({ ...prev, stock, page: 0 }))
  }, [])
  const setTerm = useCallback((term: string) => {
    setQuery(({ filter, ...prev }) => ({ ...prev, query: term, page: 0 }))
  }, [])
  const removeFilter = useCallback((id: number) => {
    setQuery(({ filter, ...prev }) => ({
      ...prev,
      string: prev.string?.filter((f) => f.id !== id),
      range: prev.range?.filter((f) => f.id !== id),
      page: 0,
    }))
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      mergeQuery: (query: ItemsQuery) => {
        setQuery(({ filter, ...prev }) => ({
          ...prev,
          ...mergeFilters(prev, query),
          page: 0,
        }))
      },
      setQuery,
    }),
    [],
  )

  const setFilter = useCallback(
    (id: number, value: string[] | Omit<NumberField, 'id'>) => {
      if (isNumberValue(value)) {
        setQuery((prev) => ({
          ...prev,
          page: 0,
          range: [
            ...(prev.range?.filter((r) => r.id !== id) ?? []),
            { id, ...value },
          ],
        }))
      } else {
        setQuery(({ filter, ...prev }) => ({
          ...prev,
          page: 0,
          string: [
            ...(prev.string?.filter((r) => r.id !== id) ?? []),
            { id, value },
          ],
        }))
      }
    },
    [],
  )

  const setFilterTerm = useCallback((filter: string) => {
    setQuery((prev) => ({
      ...prev,
      page: 0,
      filter,
    }))
  }, [])

  useEffect(() => {
    virtualPage.current = query.page ?? 0

    const key = toQuery(query)
    setQueryHistory((prev) => {
      if (prev.some((d) => d.key === key)) {
        return prev
      }
      if (prev.length >= 10) {
        prev.shift()
      }
      return [...prev, { ...query, key: key }]
    })

    console.log('query key changed', key)
    setItemsKey(key)
  }, [query])

  const addPage = useCallback(async () => {
    const virtualQuery = { ...query, page: virtualPage.current + 1 }

    const virtualKey = toQuery(virtualQuery)
    return api.streamItems(virtualKey).then((data): AddPageResult => {
      if (data?.items == null) {
        return {
          currentPage: virtualPage.current,
          hasMorePages: false,
          totalPages: virtualPage.current,
        }
      }
      itemsCache.set(virtualKey, data.items)

      virtualPage.current = data.page
      setHits((prev) => [...prev, ...data.items])
      return {
        currentPage: data.page,
        hasMorePages: data.page < (data.totalHits ?? 0) / (data.pageSize ?? 20),
        totalPages: Math.ceil((data.totalHits ?? 0) / (data.pageSize ?? 20)),
      }
    })
  }, [query])
  useEffect(() => {
    if (!attachToHash) {
      return
    }
    const hashListener = () => {
      const hash = window.location.hash.substring(1)
      if (hash) {
        setQuery(fromQueryString(hash))
      } else {
        setQuery(initialQuery ?? {})
      }
    }
    addEventListener('hashchange', hashListener, false)
    return () => {
      removeEventListener('hashchange', hashListener, false)
    }
  }, [attachToHash, initialQuery])

  useEffect(() => {
    if (itemsKey == null) {
      return
    }
    if (itemsKey === 'page=0&size=20') {
      return
    }
    if (attachToHash) {
      if (itemsKey !== window.location.hash.substring(1)) {
        window.history.pushState(null, 'hash', `#${itemsKey}`)
      }
    }
    //window.location.hash = itemsKey;

    if (itemsCache.has(itemsKey)) {
      setHits(itemsCache.get(itemsKey) ?? [])
    }

    setIsLoading(true)
    console.log('streaming items', itemsKey)
    api.streamItems(itemsKey).then((data) => {
      itemsCache.set(itemsKey, data?.items)
      setHits(data?.items ?? [])
      setQuery((prev) => ({
        ...prev,
        page: data?.page ?? prev.page,
        pageSize: data?.pageSize ?? prev.pageSize,
      }))
      setTotalHits(data?.totalHits ?? 0)
      setIsLoading(false)
    })
  }, [itemsKey, attachToHash])

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
  )
}
