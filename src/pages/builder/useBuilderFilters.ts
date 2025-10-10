import { useMemo } from 'react'
import { SelectedAdditionalFilter } from './builder-types'
import { GPU, CPU, PSU } from './rules'
import { useBuilderContext } from './useBuilderContext'
import { useRecommendedWatt } from './useRecommendedWatt'

export const useBuilderFilters = (): SelectedAdditionalFilter[] => {
  const { selectedItems, components } = useBuilderContext()
  const neededPsuWatt = useRecommendedWatt()

  return useMemo(() => {
    const wattQueries =
      neededPsuWatt > 500
        ? [
            {
              to: PSU,
              id: 31986,
              from: neededPsuWatt > 300 ? GPU : CPU,
              value: { min: neededPsuWatt, max: 3000 },
            },
          ]
        : []
    return [
      ...wattQueries,
      ...selectedItems.flatMap((item) =>
        components[item.componentId]?.filtersToApply.flatMap((f) => {
          if (f.converter) {
            const converted = f.converter(item.values)

            return converted !== undefined
              ? converted.map((d) => ({
                  ...d,
                  to: f.to,
                  from: item.componentId,
                }))
              : []
          }
          const value = item.values?.[f.id]

          return typeof value === 'string'
            ? [{ id: f.id, to: f.to, value, from: item.componentId }]
            : []
        }),
      ),
    ]
  }, [selectedItems, neededPsuWatt, components])
}
