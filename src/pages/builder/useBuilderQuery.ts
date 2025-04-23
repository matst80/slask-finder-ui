import { useContext, useMemo } from "react";
import { BuilderContext } from "./builder-context";
import {
  fixSingleArray,
  isRangeFilter,
  isStringFilter,
  isUniqueFilter,
} from "./builder-utils";
import { FilteringQuery } from "../../lib/types";

export const useBuilderQuery = (selectedComponentId: number) => {
  const ctx = useContext(BuilderContext);
  if (!ctx) {
    throw new Error("useBuilderQuery must be used within a BuilderProvider");
  }
  const { appliedFilters, rules } = ctx;
  const selectionFilters = useMemo(
    () =>
      appliedFilters
        ?.filter((d) => d?.to === selectedComponentId)
        .filter(isUniqueFilter),
    [appliedFilters, selectedComponentId]
  );
  return useMemo(() => {
    const selectedComponent = rules
      .flatMap((d) => {
        if (d.type === "component") {
          return [d];
        }
        if (d.type === "group") {
          return d.components ?? [];
        }
        if (d.type === "selection") {
          return d.options ?? [];
        }
        return [];
      })
      .filter((d) => d?.type === "component")
      .find((d) => d.id === selectedComponentId);

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
  }, [selectionFilters, rules, selectedComponentId]);
};
