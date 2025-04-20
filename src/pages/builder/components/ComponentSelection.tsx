import { useState } from "react";


import { ComponentSelector } from "./ComponentSelector";
import { ComponentSelection } from "../builder-types"
import { Item } from "../../../lib/types"
import { useBuilderContext } from "../useBuilderContext"
import { isUniqueFilter } from "../builder-utils"

type Props = {
  data: ComponentSelection;
  onSelectedChange: (componentId: number) => (item: Item | null) => void;
};
export const ComponentSelectionSelector = ({
  data,
  onSelectedChange,
}: Props) => {
  const [selectedId, setSelectedId] = useState(data.options[0]?.id);
  const { selectedItems, appliedFilters } = useBuilderContext();
  return (
    <>
      <div className="flex gap-6 my-6">
        {data.options.map((component) => {
          return (
            <button
              key={component.title}
              onClick={() => setSelectedId(component.id)}
              className="flex gap-2 items-center flex-1"
            >
              
              <span>{component.title}</span>
            </button>
          );
        })}
      </div>
      <div>
        {data.options
          .filter((d) => d.id === selectedId)
          .map((component) => {
            return (
              <div key={component.title}>
                <ComponentSelector
                  {...component}
                  selectedIds={selectedItems.map((d) => Number(d.id))}
                  otherFilters={appliedFilters
                    .filter((d) => d.to === component.id)
                    .filter(isUniqueFilter)}
                  onSelectedChange={onSelectedChange(component.id)}
                />
              </div>
            );
          })}
      </div>
    </>
  );
};
