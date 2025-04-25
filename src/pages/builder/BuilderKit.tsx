import { useEffect, useMemo } from "react";
import { getRawData } from "../../lib/datalayer/api";
import { componentRules } from "./rules";
import { flattenComponents } from "./builder-utils";
import { Item } from "../../lib/types";
import { Component, ItemWithComponentId } from "./builder-types";
import { useBuilderContext } from "./useBuilderContext";
import { ImpressionProvider } from "../../lib/hooks/ImpressionProvider";
import { SelectedComponentItem } from "./SelectedComponentItem";

const itemIds = [
  853526, 788565, 876765, 853847, 841461, 841470, 854280, 853858,
];

const matchValue = (
  itemValue: string[] | string | number | undefined,
  filterValue: string[] | string | number
): boolean => {
  if (typeof itemValue === "string" && typeof filterValue === "string") {
    return itemValue.toLowerCase() === filterValue.toLowerCase();
  }
  if (typeof itemValue === "number" && typeof filterValue === "number") {
    return itemValue === filterValue;
  }
  if (Array.isArray(itemValue) && Array.isArray(filterValue)) {
    return itemValue.some((value) =>
      filterValue.some((filter) => matchValue(value, filter))
    );
  }
  if (Array.isArray(itemValue) && typeof filterValue === "string") {
    return itemValue.some((value) => matchValue(value, filterValue));
  }
  if (typeof itemValue === "string" && Array.isArray(filterValue)) {
    return filterValue.some((value) => matchValue(itemValue, value));
  }
  return false;
};

const matchComponent = (
  item: Item,
  allComponents: Component[]
): ItemWithComponentId | undefined => {
  for (const { filter, id } of allComponents) {
    const matchesStrings = filter.string?.every(({ id, value }) =>
      matchValue(item.values[id], value)
    );
    if (matchesStrings) {
      console.log("matchesStrings", matchesStrings, item.id, id);
      return { ...item, componentId: id };
    }
  }
  return undefined;
};

export const BuilderKit = () => {
  const { setSelectedItems, components, selectedItems } = useBuilderContext();

  const allComponents = useMemo(
    () => componentRules.flatMap(flattenComponents),
    []
  );
  useEffect(() => {
    Promise.all(itemIds.map((id) => getRawData(id)))
      .then((res) =>
        res.flatMap((item) => {
          const itemWithComponentId = matchComponent(item, allComponents);
          return itemWithComponentId != null ? [itemWithComponentId] : [];
        })
      )
      .then((selectedItems) => {
        setSelectedItems(selectedItems);
      });
  }, [allComponents, setSelectedItems]);
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      <h1 className="text-2xl mb-6 font-bold">Premade example</h1>

      <p>Example of a pre-made kit</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ImpressionProvider>
          {selectedItems.map((item, i) => {
            const component = components[item.componentId];
            const maxQuantity =
              component?.maxQuantity != null
                ? component.maxQuantity(selectedItems)
                : 1;
            return (
              <SelectedComponentItem
                key={i}
                position={i}
                {...item}
                maxQuantity={maxQuantity}
              />
            );
          })}
        </ImpressionProvider>
      </div>
    </div>
  );
};
