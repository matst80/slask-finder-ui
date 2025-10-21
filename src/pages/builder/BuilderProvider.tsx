import { PropsWithChildren, useMemo, useState } from 'react'
import { BuilderContext } from './builder-context'
import {
  Component,
  ComponentId,
  ItemWithComponentId,
  Rule,
  RuleId,
} from './builder-types'
import { flattenComponents } from './builder-utils'
import { defaultComponentOrder } from './rules'

type BuilderProps = {
  initialItems?: ItemWithComponentId[]
  initialRules: Rule[]
  initialOrder?: RuleId[]
}

export const BuilderProvider = ({
  initialItems,
  initialRules,
  children,
  initialOrder,
}: PropsWithChildren<BuilderProps>) => {
  const [order, setOrder] = useState<RuleId[]>(
    initialOrder ?? defaultComponentOrder,
  )
  const [rules, updateRules] = useState<Rule[]>(initialRules)

  const [selectedItems, setSelectedItems] = useState<ItemWithComponentId[]>(
    initialItems ?? [],
  )

  const reset = () => {
    setOrder(defaultComponentOrder)
    setSelectedItems([])
  }

  const components = useMemo(() => {
    return rules.flatMap(flattenComponents).reduce(
      (acc, d) => {
        return {
          ...acc,
          [d.id]: d,
        }
      },
      {} as Record<ComponentId, Component>,
    )
  }, [rules])

  return (
    <BuilderContext.Provider
      value={{
        selectedItems,
        components,
        order,
        setOrder,
        updateRules,
        setSelectedItems,
        rules,
        reset,
      }}
    >
      {children}
    </BuilderContext.Provider>
  )
}
