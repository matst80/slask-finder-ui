import { createContext } from "react";
import {
  ItemWithComponentId,
  Rule,
  SelectedAdditionalFilter,
} from "./builder-types";

export const BuilderContext = createContext<{
  selectedComponentId: number | undefined;
  selectedItems: ItemWithComponentId[];
  updateRules: React.Dispatch<React.SetStateAction<Rule[]>>;
  setSelectedComponentId: (id: number | undefined) => void;
  order: number[];
  setOrder: React.Dispatch<React.SetStateAction<number[]>>;
  rules: Rule[];
  neededPsuWatt: number;
  setSelectedItems: React.Dispatch<React.SetStateAction<ItemWithComponentId[]>>;
  appliedFilters: SelectedAdditionalFilter[];
  reset: () => void;
} | null>(null);
