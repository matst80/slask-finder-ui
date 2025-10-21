import { useEffect } from 'react'
import { mergeFilters } from '../lib/hooks/queryUtils'
import { useQuery } from '../lib/hooks/useQuery'
import { FilteringQuery } from '../lib/types'

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
