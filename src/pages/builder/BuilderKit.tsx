import { useEffect, useMemo } from 'react'
import { getRawData } from '../../lib/datalayer/api'
import { componentRules } from './rules'
import { flattenComponents } from './builder-utils'
import { Item } from '../../lib/types'
import { Component, ItemWithComponentId } from './builder-types'
import { useBuilderContext } from './useBuilderContext'
import { ImpressionProvider } from '../../lib/hooks/ImpressionProvider'
import { SelectedComponentItem } from './SelectedComponentItem'
import { matchValue } from '../../lib/utils'

const itemIds = [841468, 883821, 861201, 842510, 842804, 854270, 519763, 855844]

const matchComponent = (
  item: Item,
  allComponents: Component[],
): ItemWithComponentId | undefined => {
  for (const { filter, id, parentId } of allComponents) {
    const matchesStrings = filter.string?.every(({ id, value }) =>
      matchValue(item.values[id], value),
    )
    if (matchesStrings) {
      return { ...item, componentId: id, parentId }
    }
    if (filter.range != null && filter.range.length > 0) {
      console.warn("has range, and it's not handled yet", filter.range)
    }
  }
  return undefined
}

export const BuilderKit = () => {
  const { setSelectedItems, components, selectedItems } = useBuilderContext()

  const allComponents = useMemo(
    () => componentRules.flatMap(flattenComponents),
    [],
  )
  useEffect(() => {
    Promise.all(itemIds.map((id) => getRawData(id)))
      .then((res) =>
        res.flatMap((item) => {
          const itemWithComponentId = matchComponent(item, allComponents)
          return itemWithComponentId != null ? [itemWithComponentId] : []
        }),
      )
      .then((selectedItems) => {
        setSelectedItems(selectedItems)
      })
  }, [allComponents, setSelectedItems])
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      <h1 className="text-2xl mb-6 font-bold">Premade example</h1>

      <p>Example of a pre-made kit</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ImpressionProvider>
          {selectedItems.map((item, i) => {
            const component = components[item.componentId]
            const maxQuantity =
              component?.maxQuantity != null
                ? component.maxQuantity(selectedItems)
                : 1
            return (
              <SelectedComponentItem
                key={i}
                position={i}
                {...item}
                maxQuantity={maxQuantity}
              />
            )
          })}
        </ImpressionProvider>
      </div>
    </div>
  )
}
