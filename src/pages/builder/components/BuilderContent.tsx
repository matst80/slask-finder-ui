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
    //const nextId = order[currentIdx + 1];
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-[250px,1fr]">
        <div className="flex md:flex-col gap-6 p-4 min-w-0">
          <SelectedItemsList />
        </div>

        <div className="relative md:py-4 md:pr-4 px-4 min-w-0" id="builder_top">
          {openComponent?.type === "component" && (
            <ComponentSelector
              key={openComponent.title}
              {...openComponent}
              selectedIds={selectedItems.map((d) => Number(d.id))}
              otherFilters={appliedFilters
                .filter((d) => d.to === openComponent.id)
                .filter(isUniqueFilter)}
              onSelectedChange={onSelectedChange(openComponent.id)}
            />
          )}
          {openComponent?.type === "selection" && (
            <ComponentSelectionSelector
              data={openComponent}
              onSelectedChange={onSelectedChange}
            />
          )}
          {openComponent == null && selectedItems.length > 0 && (
            <SelectionOverview items={selectedItems} />
          )}
          {openComponent == null && selectedItems.length === 0 && (
            <>
              <div className="text-[#242424] text-2xl font-normal">
                Var vill du starta?
              </div>
              <div className="flex flex-col md:flex-row gap-6 mt-8">
                {rules
                  .filter((d) => d.type === "component")
                  .filter((d) => d.startingText != null)
                  .map((component, idx) => {
                    return (
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
                    );
                  })}
              </div>
            </>
          )}
        </div>

        {selectedItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-10 space-y-4 border-t border-gray-200 bg-white p-4">
            <div className="wrapper flex justify-between gap-2 items-center">
              <div className="flex items-center gap-4 flex-grow">
                <div className="flex flex-col">
                  <h2>Summa:</h2>
                  <span className="text-xs">Min PSU: {neededPsuWatt}w</span>
                </div>
                <span className="font-headline text-[2rem] leading-[2rem]">
                  {sum}
                  .-
                </span>
              </div>
              <div className="hidden lg:block text-xl font-bold font-elkjop uppercase tracking-tight">
                <span className="text-black">Ditt bygge&nbsp;</span>
                <span className="text-[#4a90e2]">{percentDone}% klart</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-full hidden lg:block"
                  onClick={() => setSelectedItems([])}
                >
                  Börja om
                </Button>
                <Button
                  variant="default"
                  className="w-full"
                  
                >
                  Lägg till i kundvagn
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};