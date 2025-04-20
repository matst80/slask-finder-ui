import { useRef, useEffect } from "react"
import { isDefined } from "../../../utils"
import { useBuilderContext } from "../useBuilderContext"
import { ComponentSelectorBox } from "./ComponentSelectorBox"

export const SelectedItemsList = () => {
  const {
    order,
    rules,
    selectedItems,
    setSelectedComponentId,
    selectedComponentId,
  } = useBuilderContext();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current
        .querySelector(`[data-id="${selectedComponentId}"]`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
    }
  }, [selectedComponentId]);
  return (
    <div
      ref={ref}
      className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible"
    >
      {order
        .map((id) => rules.find((d) => d.id == id))
        .filter(isDefined)
        .map(({ title, id }) => {
          const selectedComponent = selectedItems.find(
            (d) => d.componentId === id,
          );
          const currentRule = rules.find((d) => d.id === id);
          if (currentRule == null) return null;

          if (
            currentRule.disabled != null &&
            currentRule.disabled(selectedItems)
          ) {
            // console.log("disable", currentRule, selectedItems);
            return null;
          }

          const optionSelected =
            currentRule?.type === "selection"
              ? selectedItems.find((d) =>
                  currentRule.options.find((o) => o.id === d.componentId),
                )
              : undefined;
          return (
            <ComponentSelectorBox
              key={id}
              id={id}
              onClick={() =>
                setSelectedComponentId(
                  selectedComponentId === id ? undefined : id,
                )
              }
              title={title}
              isActive={selectedComponentId === id}
              selected={optionSelected ?? selectedComponent}
            />
          );
        })}
    </div>
  );
};