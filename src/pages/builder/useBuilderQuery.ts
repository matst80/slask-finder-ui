import { useContext, useMemo } from "react";
import { BuilderContext } from "./builder-context";
import { fixSingleArray, isRangeFilter, isStringFilter } from "./builder-utils";
import { FilteringQuery } from "../../lib/types";
import { useComponentFilters } from "./useComponentFilters";

export const useBuilderQuery = (selectedComponentId: number) => {
  const ctx = useContext(BuilderContext);
  if (!ctx) {
    throw new Error("useBuilderQuery must be used within a BuilderProvider");
  }
  const { components } = ctx;
  const selectionFilters = useComponentFilters(selectedComponentId);

  return useMemo(() => {
    const selectedComponent = components[selectedComponentId];

    return {
      selectionFilters,
      component: selectedComponent,
      requiredQuery: {
        range: [
          ...selectionFilters
            .filter(isRangeFilter)
            .map(({ id, value }) => ({ id, min: value.min, max: value.max })),
          ...(selectedComponent?.filter?.range ?? []),
        ],
        string: [
          ...selectionFilters.filter(isStringFilter).map(fixSingleArray),
          ...(selectedComponent?.filter.string ?? []),
        ],
      } satisfies Pick<FilteringQuery, "string" | "range">,
    };
  }, [selectionFilters, components, selectedComponentId]);
};
