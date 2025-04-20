import { Item, ItemsQuery, ItemValues } from "../../lib/types";

export type ItemWithComponentId = Item & { componentId: number };

export type ConverterResult = {
  id: number;
  value: string | string[] | { min: number; max: number };
};

export type AdditionalFilter = {
  id: number;
  to: number;
  converter?: (values: ItemValues) => ConverterResult[];
};

export type QuickFilter = {
  name: string;
  options: {
    title: string;
    filters: { id: number; value: FilterValue }[];
  }[];
};

export type Component = {
  type: "component";
  title: string;
  id: number;
  requires?: number[];
  ignoreIfComponentSelected?: number;
  startingText?: string;
  order?: number[];
  nextComponentId?: number;
  quickFilters?: QuickFilter[];
  validator?: (values: ItemValues) => boolean;
  filtersToApply: AdditionalFilter[];
  filter: ItemsQuery;
  disabled?: (selectedItems: ItemWithComponentId[]) => boolean;
  topFilters?: number[];
  importantFacets?: number[];
};

export type ComponentSelection = {
  type: "selection";
  title: string;
  id: number;
  disabled?: (selectedItems: ItemWithComponentId[]) => boolean;
  options: Component[];
};

export type ComponentGroup = {
  type: "group";
  title: string;
  id: number;
  disabled?: (selectedItems: ItemWithComponentId[]) => boolean;
  components: Component[];
};

export type Rule = Component | ComponentGroup | ComponentSelection;

export type FilterValue = string | string[] | { min: number; max: number };

export type SelectedAdditionalFilter = AdditionalFilter & {
  value: FilterValue;
};
