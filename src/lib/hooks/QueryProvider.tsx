import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { fromQueryString, toQuery } from '../../hooks/searchHooks'
import { getJinaColbertEmbeddingLocal } from '../../utils/jina'
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

const embeddingCache = new Map<string, api.QueryVectors>()

const getQueryVectors = async (
  term: string | undefined,
): Promise<api.QueryVectors | undefined> => {
  if (!term) return undefined
  const trimmed = term.trim()
  if (!trimmed || trimmed === '*') return undefined

  if (embeddingCache.has(trimmed)) {
    return embeddingCache.get(trimmed)
  }

  try {
    console.log('Computing local query embedding for:', trimmed)
    const startTime = performance.now()
    const res = await getJinaColbertEmbeddingLocal(trimmed)
    const duration = performance.now() - startTime
    console.log(
      `Local query embedding computed in ${duration.toFixed(2)}ms for: "${trimmed}"`,
    )
    const shape = res.shape
    const num_tokens = shape.length === 3 ? shape[1] : shape[0]
    const dim = shape.length === 3 ? shape[2] : shape[1]
    const vectors = {
      num_tokens,
      dim,
      vectors: res.data,
    }
    embeddingCache.set(trimmed, vectors)
    return vectors
  } catch (err) {
    console.warn('Failed to generate local query embedding:', err)
    return undefined
  }
}

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
      q.mode = 'bm25'
    }
    return q
  })
  const itemsKey = toQuery(query)
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
  }, [query])

  const addPage = useCallback(async () => {
    const virtualQuery = { ...query, page: virtualPage.current + 1 }

    const virtualKey = toQuery(virtualQuery)
    const vectors =
      query.mode === 'embeddings'
        ? await getQueryVectors(query.query)
        : undefined
    return api.streamItems(virtualKey, vectors).then((data): AddPageResult => {
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
    if (query.mode === 'embeddings') {
      import('../../utils/jina').then(({ preloadModel }) => preloadModel())
    }
  }, [query.mode])

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
    console.log('streaming items', itemsKey)
    const vectorPromise =
      query.mode === 'embeddings'
        ? getQueryVectors(query.query)
        : Promise.resolve(undefined)

    vectorPromise.then((vectors) => {
      const apiStart = performance.now()
      api.streamItems(itemsKey, vectors).then((data) => {
        const duration = performance.now() - apiStart
        console.log(
          `Search items streamed in ${duration.toFixed(2)}ms for key: "${itemsKey}"`,
        )
        itemsCache.set(itemsKey, data?.items)
        setHits(data?.items ?? [])
        setTotalHits(data?.totalHits ?? 0)
        setIsLoading(false)
      })
    })
  }, [itemsKey, attachToHash, query.query, query.mode])

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
