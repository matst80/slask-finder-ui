import { createContext } from "react";
import { Component, ItemWithComponentId, Rule } from "./builder-types";

export const BuilderContext = createContext<{
  selectedItems: ItemWithComponentId[];
  updateRules: React.Dispatch<React.SetStateAction<Rule[]>>;
  order: number[];
  setOrder: React.Dispatch<React.SetStateAction<number[]>>;
  rules: Rule[];
  components: Record<number, Component>;
  setSelectedItems: React.Dispatch<React.SetStateAction<ItemWithComponentId[]>>;
  reset: () => void;
} | null>(null);
