import { useMemo } from 'react'
import { isDefined } from '../../utils'
import { ComponentId, SelectedAdditionalFilter } from './builder-types'
import { useBuilderFilters } from './useBuilderFilters'

export const useComponentFilters = (
  componentId?: ComponentId,
): SelectedAdditionalFilter[] => {
  const filters = useBuilderFilters()

  return useMemo(
    () => filters.filter(isDefined).filter((d) => d.to === componentId),
    [filters, componentId],
  )
}
