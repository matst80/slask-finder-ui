import { useMemo, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Item } from "../../../lib/types"
import { isUniqueFilter } from "../builder-utils"
import { useBuilderContext } from "../useBuilderContext"
import { ComponentRule } from "./ComponentRule"
import { ComponentSelectionSelector } from "./ComponentSelection"
import { ComponentSelector } from "./ComponentSelector"
import { SelectedItemsList } from "./SelectedComponentsList"
import { SelectionOverview } from "./SelectionOverview"

export const BuilderContent = () => {
  const {
    selectedItems,
    selectedComponentId,
    setSelectedComponentId,
    rules,
    percentDone,
    order,
    setSelectedItems,
    neededPsuWatt,
    setOrder,
    sum,
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
        id !== componentId && !selectedIds.has(id) && idx > currentIdx,
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
    [selectedComponentId, rules],
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
      <main className="flex flex-col md:flex-row gap-4 md:gap-8 m-6" id="builder_top">
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
      {selectedItems.length > 0 && (
        <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
              {/* Price information */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex flex-col">
                  <h2 className="text-gray-700 font-medium">Summa:</h2>
                  <span className="text-xs text-gray-500">Min PSU: {neededPsuWatt}w</span>
                </div>
                <span className="font-headline text-2xl sm:text-3xl font-bold ml-auto sm:ml-0">
                  {sum}.-
                </span>
              </div>
              
              {/* Build progress indicator */}
              <div className="hidden lg:block text-lg font-bold font-elkjop uppercase tracking-tight">
                <span className="text-black">Ditt bygge&nbsp;</span>
                <span className="text-[#4a90e2]">{percentDone}% klart</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  onClick={() => setSelectedItems([])}
                >
                  Börja om
                </Button>
                <Button
                  variant="default"
                  className="flex-1 sm:flex-none"
                >
                  Lägg till i kundvagn
                </Button>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};