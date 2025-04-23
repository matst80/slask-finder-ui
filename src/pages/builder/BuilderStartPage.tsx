import { useNavigate } from "react-router-dom";
import { ComponentRule } from "./components/ComponentRule";
import { useBuilderContext } from "./useBuilderContext";

export const BuilderStartPage = () => {
  const { rules, setSelectedComponentId, setOrder } = useBuilderContext();
  const push = useNavigate();
  return (
    <div className="animate-fadeIn space-y-8 mx-auto max-w-5xl p-6">
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
                push("/builder/component/" + component.id);
              }}
            />
          ))}
      </div>
    </div>
  );
};
