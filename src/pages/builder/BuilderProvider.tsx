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
} from "./rules";
import { flattenComponents } from "./builder-utils";
//import { FilteringQuery } from "../../lib/types";

type BuilderProps = {
  initialItems?: ItemWithComponentId[];
  initialRules: Rule[];
  //onSelectionChange?: (items: ItemWithComponentId[]) => void;
};

export const BuilderProvider = ({
  initialItems,
  initialRules,
  children,
}: //onSelectionChange,
PropsWithChildren<BuilderProps>) => {
  const [order, setOrder] = useState<number[]>([
    CPU,
    MOTHERBOARD,
    RAM,
    STORAGE,
    GPU,
    CASE,
    PSU,
    COOLER,
  ]);
  const [rules, updateRules] = useState<Rule[]>(initialRules);

  // const [selectedComponentId, setSelectedComponentId] = useState<
  //   number | undefined
  // >();

  const [selectedItems, setSelectedItems] = useState<ItemWithComponentId[]>(
    initialItems ?? []
  );

  const reset = () => {
    //setSelectedComponentId(undefined);
    setSelectedItems([]);
  };
  // useEffect(() => {
  //   if (onSelectionChange == null) return;
  //   requestAnimationFrame(() => {
  //     onSelectionChange(selectedItems);
  //   });
  // }, [selectedItems, onSelectionChange]);

  const components = useMemo(() => {
    return rules.flatMap(flattenComponents).reduce((acc, d) => {
      return {
        ...acc,
        [d.id]: d,
      };
    }, {} as Record<number, Component>);
  }, [rules]);

  // const addBuildToCart = () => {
  //   if (onAddToCart == null) return;
  //   onAddToCart(selectedItems.map((d) => ({ sku: d.sku, quantity: 1 })));
  // };

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
