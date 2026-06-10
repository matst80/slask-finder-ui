import { createContext } from 'react'
import {
  AddPageResult,
  FacetId,
  HistoryQuery,
  Item,
  ItemsQuery,
  NumberField,
} from '../types'

type QueryContextType = {
  query: ItemsQuery
  hits: Item[]
  totalHits: number
  isLoading: boolean
  queryHistory: HistoryQuery[]
  setQuery: React.Dispatch<React.SetStateAction<ItemsQuery>>
  addPage: () => Promise<AddPageResult>
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  setSort: (sort: string) => void
  setStock: (stock: string[]) => void
  setTerm: (term: string) => void
  setFilterTerm: (filter: string) => void
  removeFilter: (id: FacetId) => void
  setFilter: (id: FacetId, value: string[] | Omit<NumberField, 'id'>) => void
}

export const QueryContext = createContext<QueryContextType | null>(null)
