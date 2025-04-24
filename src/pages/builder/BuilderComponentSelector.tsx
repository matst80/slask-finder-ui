import { useLoaderData, useNavigate } from "react-router-dom";
import { Rule } from "./builder-types";
import { useBuilderContext } from "./useBuilderContext";
import { ComponentSelectorBox } from "./BuilderStartPage";

export const BuilderComponentSelector = () => {
  const component = useLoaderData() as Rule;
  const push = useNavigate();
  const { selectedItems, setSelectedComponentId } = useBuilderContext();
  if (!component || component.type !== "selection") {
    return <div>not correct!</div>;
  }
  return (
    <div className="animate-fadeIn space-y-10 mx-auto max-w-6xl p-8">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center flex-wrap">
        {component.options
          .filter((d) => d.type === "component")
          .filter(
            (d) =>
              d.startingText != null &&
              (d.disabled == null || !d.disabled(selectedItems))
          )
          .map((component, idx) => (
            <ComponentSelectorBox
              key={component.id}
              {...component}
              headerText="Choose"
              isRecommended={idx === 0}
              onClick={() => {
                setSelectedComponentId(component.id);
                push(
                  `/builder/component/${component.id}?parentId=${component.id}`
                );
              }}
            />
          ))}
      </div>
    </div>
  );
};
