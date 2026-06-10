import {
  FilteringQuery,
  mergeFilters,
  useQuery,
} from '@matst80/slask-finder-sdk'
import { useEffect } from 'react'

export const QueryMerger = ({ query }: { query: FilteringQuery }) => {
  const { setQuery } = useQuery()
  useEffect(() => {
    setQuery((old) => ({ ...old, ...mergeFilters(old, query) }))
  }, [query, setQuery])
  return null
}

export const QueryUpdater = ({ query }: { query: FilteringQuery }) => {
  const { setQuery } = useQuery()
  useEffect(() => {
    setQuery(query)
  }, [query, setQuery])
  return null
}
