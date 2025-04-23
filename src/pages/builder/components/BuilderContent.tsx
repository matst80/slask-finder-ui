import { useMemo, useEffect } from "react";

import { Item } from "../../../lib/types";
import { isUniqueFilter } from "../builder-utils";
import { useBuilderContext } from "../useBuilderContext";
import { ComponentRule } from "./ComponentRule";
import { ComponentSelectionSelector } from "./ComponentSelection";
import { ComponentSelector } from "./ComponentSelector";
import { SelectedItemsList } from "./SelectedComponentsList";
import { SelectionOverview } from "./SelectionOverview";
import { BuilderFooterBar } from "./BuilderFooterBar";

export const BuilderContent = () => {
  const {
    selectedItems,
    selectedComponentId,
    setSelectedComponentId,
    rules,

    order,
    setSelectedItems,

    setOrder,

    appliedFilters,
  } = useBuilderContext();

  const onSelectedChange = (componentId: number) => (item: Item | null) => {
    const currentIdx = order.findIndex((id) => id === componentId);
    const selectedIds = new Set([
      ...selectedItems.map((d) => d.componentId),
      ...rules.filter((d) => d.disabled).map((d) => d.id),
    ]);

    const nextId = order.find(
      (id, idx) =>
        id !== componentId && !selectedIds.has(id) && idx > currentIdx
    );
    if (item != null && nextId) {
      setSelectedComponentId(nextId);
    }

    setSelectedItems((p) => {
      const newItems = p.filter((i) => i.componentId !== componentId);
      if (item) {
        return [...newItems, { ...item, componentId }];
      }
      return newItems;
    });
  };

  const openComponent = useMemo(
    () => rules.find((d) => d.id === selectedComponentId),
    [selectedComponentId, rules]
  );

  useEffect(() => {
    document
      .getElementById("main-content")
      ?.scrollIntoView({ behavior: "smooth" });
  }, [selectedComponentId]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with selected items */}
      <header className="sticky top-0 z-20 bg-white shadow-md shadow-white">
        <SelectedItemsList />
      </header>

      {/* Main content area */}
      <main
        className="flex flex-col md:flex-row gap-4 md:gap-8 m-6"
        id="builder_top"
      >
        {/* Show open component selector */}
        {openComponent?.type === "component" && (
          <div className="animate-fadeIn">
            <ComponentSelector
              key={openComponent.title}
              {...openComponent}
              selectedIds={selectedItems.map((d) => Number(d.id))}
              otherFilters={appliedFilters
                .filter((d) => d.to === openComponent.id)
                .filter(isUniqueFilter)}
              onSelectedChange={onSelectedChange(openComponent.id)}
            />
          </div>
        )}

        {/* Show component selection selector */}
        {openComponent?.type === "selection" && (
          <div className="animate-fadeIn">
            <ComponentSelectionSelector
              data={openComponent}
              onSelectedChange={onSelectedChange}
            />
          </div>
        )}

        {/* Show overview of selected items */}
        {openComponent == null && selectedItems.length > 0 && (
          <div className="animate-fadeIn">
            <SelectionOverview items={selectedItems} />
          </div>
        )}

        {/* Show starting options */}
        {openComponent == null && selectedItems.length === 0 && (
          <div className="animate-fadeIn space-y-8">
            <h2 className="text-[#242424] text-2xl md:text-3xl font-medium">
              Var vill du starta?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {rules
                .filter((d) => d.type === "component")
                .filter((d) => d.startingText != null)
                .map((component, idx) => (
                  <ComponentRule
                    key={component.id}
                    {...component}
                    isRecommended={idx === 0}
                    onClick={() => {
                      if (component.order != null) {
                        setOrder(component.order);
                      }
                      setSelectedComponentId(component.id);
                    }}
                  />
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom action bar */}
      {selectedItems.length > 0 && <BuilderFooterBar />}
    </div>
  );
};
