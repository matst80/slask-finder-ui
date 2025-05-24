"use client";
import { createContext } from "react";
import {
  Component,
  ComponentId,
  ItemWithComponentId,
  Rule,
  RuleId,
} from "./builder-types";

export const BuilderContext = createContext<{
  selectedItems: ItemWithComponentId[];
  updateRules: React.Dispatch<React.SetStateAction<Rule[]>>;
  order: RuleId[];
  setOrder: React.Dispatch<React.SetStateAction<RuleId[]>>;
  rules: Rule[];
  components: Record<ComponentId, Component>;
  setSelectedItems: React.Dispatch<React.SetStateAction<ItemWithComponentId[]>>;
  reset: () => void;
} | null>(null);
