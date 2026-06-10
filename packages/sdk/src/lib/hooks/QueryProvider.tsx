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
  AddPageResult,
  FacetId,
  HistoryQuery,
  Item,
  ItemsQuery,
  isNumberValue,
  NumberField,
} from '../types'
import { QueryContext } from './queryContext'
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
  const [hits, setHits] = useState<Item[]>([])
  const [totalHits, setTotalHits] = useState<number>(0)
  const [query, setQuery] = useState<ItemsQuery>(() => {
    const q = initialQuery ?? (attachToHash ? loadQueryFromHash() : {})
    if (!q.mode) {
      q.mode = 'embeddings'
    }
    if (!q.embeddingSource) {
      q.embeddingSource = 'server'
    }
    return q
  })
  const itemsKey = toQuery(query)
  const [prevItemsKey, setPrevItemsKey] = useState(itemsKey)
  if (itemsKey !== prevItemsKey) {
    setPrevItemsKey(itemsKey)
    setIsLoading(true)
  }

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
  const removeFilter = useCallback((id: FacetId) => {
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
    (id: FacetId, value: string[] | Omit<NumberField, 'id'>) => {
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
  }, [query])

  const addPage = useCallback(async () => {
    const virtualQuery = { ...query, page: virtualPage.current + 1 }

    const virtualKey = toQuery(virtualQuery)

    return api
      .streamItems(virtualKey, undefined)
      .then((data): AddPageResult => {
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
        const pageSize = data.pageSize ?? 20
        const totalPages = Math.ceil((data.totalHits ?? 0) / pageSize)
        return {
          currentPage: data.page,
          hasMorePages: data.page + 1 < totalPages,
          totalPages: totalPages,
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
        const loaded = fromQueryString(hash)
        if (!loaded.mode) {
          loaded.mode = 'embeddings'
        }
        if (!loaded.embeddingSource) {
          loaded.embeddingSource = 'server'
        }
        setQuery(loaded)
      } else {
        setQuery(
          initialQuery ?? { mode: 'embeddings', embeddingSource: 'server' },
        )
      }
    }
    addEventListener('hashchange', hashListener, false)
    return () => {
      removeEventListener('hashchange', hashListener, false)
    }
  }, [attachToHash, initialQuery])

  useEffect(() => {
    const cleanKey = itemsKey.replace(/&?mode=(embeddings|bm25)/, '')
    if (cleanKey === 'page=0&size=20') {
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

    const apiStart = performance.now()
    api.streamItems(itemsKey, undefined).then((data) => {
      const duration = performance.now() - apiStart
      console.log(
        `Search items streamed in ${duration.toFixed(2)}ms for key: "${itemsKey}"`,
      )
      itemsCache.set(itemsKey, data?.items)
      setHits(data?.items ?? [])
      setTotalHits(data?.totalHits ?? 0)
      setIsLoading(false)
    })
  }, [itemsKey, attachToHash, query.mode, query.embeddingSource])

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
