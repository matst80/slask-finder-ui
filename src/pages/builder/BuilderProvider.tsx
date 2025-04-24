import { PropsWithChildren, useState, useEffect, useMemo } from "react";
import { isDefined } from "../../utils";
import { BuilderContext } from "./builder-context";
import { ItemWithComponentId, Rule } from "./builder-types";
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
//import { FilteringQuery } from "../../lib/types";

type BuilderProps = {
  initialItems?: ItemWithComponentId[];
  initialRules: Rule[];
  onSelectionChange?: (items: ItemWithComponentId[]) => void;
};

const asNumber = (value: string[] | string | number) => {
  if (typeof value === "string") {
    return parseInt(value, 10);
  }
  if (Array.isArray(value)) {
    return parseInt(value[0], 10);
  }
  return value;
};

export const BuilderProvider = ({
  initialItems,
  initialRules,
  children,
  onSelectionChange,
}: PropsWithChildren<BuilderProps>) => {
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

  const [selectedComponentId, setSelectedComponentId] = useState<
    number | undefined
  >();

  const [selectedItems, setSelectedItems] = useState<ItemWithComponentId[]>(
    initialItems ?? []
  );

  const reset = () => {
    setSelectedComponentId(undefined);
    setSelectedItems([]);
  };
  useEffect(() => {
    if (onSelectionChange == null) return;
    requestAnimationFrame(() => {
      onSelectionChange(selectedItems);
    });
  }, [selectedItems, onSelectionChange]);

  const neededPsuWatt = useMemo(() => {
    let gpuRecommendedWatt = 0;
    const allSum = selectedItems
      .map((item) => {
        if (item.componentId === GPU && item.values[32186] != null) {
          gpuRecommendedWatt = asNumber(item.values[32186]);
        }
        return [35990, 32186, 35990].reduce((acc, id) => {
          const value = item.values[id];
          if (value != null) {
            const nr = asNumber(value);
            if (!isNaN(nr) && nr > acc) {
              return nr;
            }
          }
          return acc;
        }, 0);
      })
      .reduce((sum, d) => sum + d, 0);
    return !isNaN(gpuRecommendedWatt) && gpuRecommendedWatt > 0
      ? gpuRecommendedWatt
      : allSum;
  }, [selectedItems]);

  const appliedFilters = useMemo(() => {
    const wattQueries =
      neededPsuWatt > 500
        ? [
            {
              to: 6,
              id: 31986,
              from: neededPsuWatt > 300 ? GPU : CPU,
              value: { min: neededPsuWatt, max: 3000 },
            },
          ]
        : [];
    return [
      ...wattQueries,
      ...selectedItems
        .flatMap((item) =>
          rules
            .filter((d) => d.type === "component")
            .find((c) => c.id === item.componentId)
            ?.filtersToApply.flatMap((f) => {
              if (f.converter) {
                const converted = f.converter(item.values);

                return converted !== undefined
                  ? converted.map((d) => ({
                      ...d,
                      to: f.to,
                      from: item.componentId,
                    }))
                  : null;
              }
              const value = item.values?.[f.id];

              return typeof value === "string"
                ? { id: f.id, to: f.to, value, from: item.componentId }
                : null;
            })
        )
        .flat()
        .filter(isDefined),
    ];
  }, [selectedItems, neededPsuWatt, rules]);

  // const addBuildToCart = () => {
  //   if (onAddToCart == null) return;
  //   onAddToCart(selectedItems.map((d) => ({ sku: d.sku, quantity: 1 })));
  // };

  return (
    <BuilderContext.Provider
      value={{
        selectedComponentId,
        selectedItems,
        neededPsuWatt,

        order,
        setOrder,
        updateRules,
        appliedFilters,
        setSelectedItems,

        setSelectedComponentId,

        rules,

        reset,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};
