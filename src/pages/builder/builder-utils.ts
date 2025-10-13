import { KeyValue, NumberValue } from '../../lib/types'
import {
  AdditionalFilter,
  Component,
  FacetId,
  Rule,
  SelectedAdditionalFilter,
} from './builder-types'

export const isUniqueFilter = (
  value: SelectedAdditionalFilter,
  index: number,
  self: SelectedAdditionalFilter[],
) => self.findIndex((t) => t.id === value.id) === index

export const isRangeFilter = (
  d: SelectedAdditionalFilter | { id: FacetId; value: unknown },
): d is AdditionalFilter & { value: NumberValue } => {
  return (
    'value' in d &&
    d.value != null &&
    typeof d.value === 'object' &&
    'min' in (d.value as { min: number; max: number }) &&
    'max' in (d.value as { min: number; max: number })
  )
}

export const isStringFilter = (
  d: SelectedAdditionalFilter | { id: FacetId; value: unknown },
): d is AdditionalFilter & { value: KeyValue } => {
  return 'value' in d && (Array.isArray(d.value) || typeof d.value === 'string')
}

export const asNumber = (value: string[] | string | number) => {
  if (typeof value === 'string') {
    return parseInt(value, 10)
  }
  if (Array.isArray(value)) {
    return parseInt(value[0], 10)
  }
  return value
}

export const fixSingleArray = ({
  id,
  value,
}: {
  id: FacetId
  value: KeyValue
}): {
  id: FacetId
  value: string[]
} => {
  if (Array.isArray(value)) {
    return { id, value }
  }
  return { id, value: [value] }
}

export const flattenComponents = (rule: Rule): Component[] => {
  if (rule.type === 'group') {
    return rule.components
      .flatMap(flattenComponents)
      .filter((d) => d.type === 'component')
  }
  if (rule.type === 'selection') {
    return rule.options
      .flatMap(flattenComponents)
      .filter((d) => d.type === 'component')
      .map((d) => ({ ...d, parentId: rule.id }))
  }
  return [rule]
}
