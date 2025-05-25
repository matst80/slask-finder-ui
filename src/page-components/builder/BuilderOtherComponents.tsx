"use client";
import { ButtonLink } from "../../components/ui/button";
import { useCompareContext } from "../../lib/hooks/CompareProvider";
import { ComponentId } from "./builder-types";
import { useBuilderStep } from "./useBuilderStep";

export const BuilderOtherComponents = ({
  componentId,
}: {
  componentId: ComponentId;
}) => {
  const { setItems } = useCompareContext();
  const [unselectedComponents, nextComponent] = useBuilderStep(componentId);
  if (unselectedComponents.length == 0) return null;

  return (
    <div className="mt-6 animate-pop">
      <div className="flex flex-col flex-wrap w-full md:flex-row gap-2 mt-2">
        {unselectedComponents
          .filter((d) => d.id != componentId)
          .map((item, i) => (
            <ButtonLink
              href={`/builder/${item.type}/${item.id}`}
              onClick={() => setItems([])}
              variant={item.id === nextComponent?.id ? "default" : "outline"}
              className="flex items-center gap-2"
              key={i}
            >
              {item.title}
            </ButtonLink>
          ))}
      </div>
    </div>
  );
};
