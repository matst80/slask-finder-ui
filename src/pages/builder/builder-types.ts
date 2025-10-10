import {
  FilteringQuery,
  Item,
  ItemValues,
  KeyValue,
  NumberValue,
} from '../../lib/types'

export type ItemWithComponentId = Item & {
  componentId: ComponentId
  parentId?: SelectionId
  quantity?: number
}

export type ConverterResult = {
  id: FacetId
  value: string | string[] | { min: number; max: number }
}

export type AdditionalFilter = {
  id: FacetId
  to: ComponentId
  converter?: (values: ItemValues) => ConverterResult[]
}

export type QuickFilter = {
  name: string
  options: {
    title: string
    filters: { id: FacetId; value: FilterValue }[]
  }[]
}

export type Issue = {
  type: 'error' | 'warning'
  message?: string
  facetId: FacetId
}

export type SelectionId = 'cooler'

export const isParentId = (
  parentId: string | null | undefined,
): parentId is SelectionId => {
  return parentId != null && parentId == 'cooler'
}

export type OptionsId = 'addons'

export type ComponentId =
  | 'cpu'
  | 'gpu'
  | 'motherboard'
  | 'ram'
  | 'storage'
  | 'psu'
  | 'case'
  | 'air_cooler'
  | 'liquid_cooler'
  | 'storage2'
  | 'storage3'
  | 'storage4'
  | 'screen'
  | 'keyboard'
  | 'os'
  | 'extra_storage'
  | 'mouse'

export type RuleId = ComponentId | SelectionId | OptionsId
export type FacetId = number

export type Component = {
  type: 'component'
  title: string
  id: ComponentId
  requires?: ComponentId[]
  parentId?: SelectionId
  ignoreIfComponentSelected?: number
  order?: RuleId[]
  //nextComponentId?: number;
  onSelect?: (values: ItemValues, rules: Rule[]) => Rule[]
  quickFilters?: QuickFilter[]
  validator?: (values: ItemValues) => Issue[]
  filtersToApply: AdditionalFilter[]
  filter: Pick<FilteringQuery, 'string' | 'range'>
  disabled?: (selectedItems: ItemWithComponentId[]) => boolean
  maxQuantity?: (selectedItems: ItemWithComponentId[]) => number
  topFilters?: FacetId[]
  importantFacets?: FacetId[]
}

export type ComponentSelection = {
  type: 'selection'
  title: string
  id: SelectionId
  disabled?: (selectedItems: ItemWithComponentId[]) => boolean
  options: Component[]
}

export type ComponentGroup = {
  type: 'group'
  title: string
  description?: string
  id: OptionsId
  disabled?: (selectedItems: ItemWithComponentId[]) => boolean
  components: Component[]
}

export type Rule = Component | ComponentGroup | ComponentSelection

export type FilterValue = KeyValue | NumberValue

export type SelectedAdditionalFilter = AdditionalFilter & {
  value: FilterValue
}
