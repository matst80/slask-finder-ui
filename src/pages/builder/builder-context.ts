import { createContext } from "react";
import { FilteringQuery } from "../../lib/types";
import {
  ItemWithComponentId,
  Rule,
  SelectedAdditionalFilter,
} from "./builder-types";

export const BuilderContext = createContext<{
  selectedComponentId: number | undefined;
  selectedItems: ItemWithComponentId[];
  updateRules: React.Dispatch<React.SetStateAction<Rule[]>>;
  //addBuildToCart: () => void;
  setSelectedComponentId: (id: number | undefined) => void;
  sum: number;
  order: number[];
  setOrder: React.Dispatch<React.SetStateAction<number[]>>;
  globalFilters: FilteringQuery;
  rules: Rule[];
  neededPsuWatt: number;
  setSelectedItems: React.Dispatch<React.SetStateAction<ItemWithComponentId[]>>;
  percentDone: number;
  appliedFilters: SelectedAdditionalFilter[];
  reset: () => void;
} | null>(null);
