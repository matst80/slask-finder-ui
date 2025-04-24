import { createContext } from "react";
import {
  Component,
  ItemWithComponentId,
  Rule,
  //SelectedAdditionalFilter,
} from "./builder-types";

export const BuilderContext = createContext<{
  //selectedComponentId: number | undefined;
  selectedItems: ItemWithComponentId[];
  updateRules: React.Dispatch<React.SetStateAction<Rule[]>>;
  //setSelectedComponentId: (id: number | undefined) => void;
  order: number[];
  setOrder: React.Dispatch<React.SetStateAction<number[]>>;
  rules: Rule[];
  //neededPsuWatt: number;
  components: Record<number, Component>;
  setSelectedItems: React.Dispatch<React.SetStateAction<ItemWithComponentId[]>>;

  reset: () => void;
} | null>(null);
