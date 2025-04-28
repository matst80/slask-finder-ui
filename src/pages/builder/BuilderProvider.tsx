import { PropsWithChildren, useState, useMemo } from "react";
import { BuilderContext } from "./builder-context";
import { Component, ItemWithComponentId, Rule } from "./builder-types";
import {
  CPU,
  MOTHERBOARD,
  RAM,
  STORAGE,
  GPU,
  CASE,
  PSU,
  COOLER,
  defaultComponentOrder,
} from "./rules";
import { flattenComponents } from "./builder-utils";
import { i } from "framer-motion/client";

type BuilderProps = {
  initialItems?: ItemWithComponentId[];
  initialRules: Rule[];
  initialOrder?: number[];
};

export const BuilderProvider = ({
  initialItems,
  initialRules,
  children,
  initialOrder,
}: PropsWithChildren<BuilderProps>) => {
  const [order, setOrder] = useState<number[]>(
    initialOrder ?? defaultComponentOrder
  );
  const [rules, updateRules] = useState<Rule[]>(initialRules);

  const [selectedItems, setSelectedItems] = useState<ItemWithComponentId[]>(
    initialItems ?? []
  );

  const reset = () => {
    setOrder(defaultComponentOrder);
    setSelectedItems([]);
  };

  const components = useMemo(() => {
    return rules.flatMap(flattenComponents).reduce((acc, d) => {
      return {
        ...acc,
        [d.id]: d,
      };
    }, {} as Record<number, Component>);
  }, [rules]);

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
  );
};
