import { useContext, useMemo } from 'react'
import { FilteringQuery } from '../../lib/types'
import { BuilderContext } from './builder-context'
import { ComponentId } from './builder-types'
import { fixSingleArray, isRangeFilter, isStringFilter } from './builder-utils'
import { useComponentFilters } from './useComponentFilters'

export const useBuilderQuery = (selectedComponentId?: ComponentId) => {
  const ctx = useContext(BuilderContext)
  if (!ctx) {
    throw new Error('useBuilderQuery must be used within a BuilderProvider')
  }
  const { components } = ctx
  const selectionFilters = useComponentFilters(selectedComponentId)

  return useMemo(() => {
    const selectedComponent =
      selectedComponentId != null ? components[selectedComponentId] : undefined
    console.log('builder query', {
      selectedComponentId,
      components,
      selectedComponent,
    })
    return {
      selectionFilters,
      component: selectedComponent,
      requiredQuery: {
        range: [
          ...selectionFilters
            .filter(isRangeFilter)
            .map(({ id, value }) => ({ id, min: value.min, max: value.max })),
          ...(selectedComponent?.filter?.range ?? []),
        ],
        string: [
          ...selectionFilters.filter(isStringFilter).map(fixSingleArray),
          ...(selectedComponent?.filter.string ?? []),
        ],
      } satisfies Pick<FilteringQuery, 'string' | 'range'>,
    }
  }, [selectionFilters, components, selectedComponentId])
}
