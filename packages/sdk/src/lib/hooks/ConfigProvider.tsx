import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useConfig } from '../../hooks/searchHooks'
import { Facet, FacetId, FacetValue, Item, ItemsQuery } from '../types'

type ConfiguratorContextType = {
  facets: Facet[]
  availableItems: Item[]
  handleSelect: (facetId: FacetId, value: FacetValue) => void
  getAvailableFacetValues: (facetId: FacetId) => string[]
  selections: Record<FacetId, FacetValue>
  loading: boolean
}

const ConfiguratorContext = createContext<ConfiguratorContextType | undefined>(
  undefined,
)

export const useConfigurator = () => {
  const ctx = useContext(ConfiguratorContext)
  if (!ctx) {
    throw new Error(
      'useConfigurator must be used within a ConfiguratorProvider',
    )
  }
  return ctx
}

const itemFilterFactory =
  (allItems: Item[]) => (selections: Record<FacetId, FacetValue>) => {
    if (Object.keys(selections).length === 0) {
      return allItems
    }
    return allItems.filter((item) => {
      for (const [facetId, value] of Object.entries(selections)) {
        const itemVal = item[facetId as keyof Item]
        if (String(itemVal) !== String(value)) {
          return false
        }
      }
      return true
    })
  }

export const ConfiguratorProvider = ({
  children,
  query,
}: PropsWithChildren<{ query: Pick<ItemsQuery, 'string' | 'range'> }>) => {
  const { data, isLoading } = useConfig(query)
  const [selections, setSelections] = useState<Record<FacetId, FacetValue>>({})
  const { items = [], facets = [] } = data ?? {}
  const filterItems = useMemo(() => itemFilterFactory(items), [items])

  const handleSelect = (facetId: FacetId, value: FacetValue) => {
    setSelections((prev) => {
      if (prev[facetId] === value) {
        const next = { ...prev }
        delete next[facetId]
        return next
      } else {
        return { ...prev, [facetId]: value }
      }
    })
  }

  const selectedItems = useMemo(
    () => filterItems(selections),
    [selections, filterItems],
  )

  const getAvailableFacetValues = useCallback(
    (facetId: FacetId) => {
      const values = new Set<string>()
      const otherFilters = { ...selections }
      delete otherFilters[facetId]

      filterItems(otherFilters).forEach((item) => {
        const v = item[facetId as keyof Item]
        if (v !== undefined) {
          values.add(String(v))
        }
      })
      return Array.from(values)
    },
    [selectedItems],
  )

  return (
    <ConfiguratorContext.Provider
      value={{
        selections,
        facets,
        availableItems: selectedItems,
        getAvailableFacetValues,
        handleSelect,
        loading: isLoading,
      }}
    >
      {children}
    </ConfiguratorContext.Provider>
  )
}
