import { useMemo } from "react";
import { SelectedAdditionalFilter } from "./builder-types";
import { useBuilderFilters } from "./useBuilderFilters";

export const useComponentFilters = (
  componentId: number
): SelectedAdditionalFilter[] => {
  const filters = useBuilderFilters();

  return useMemo(
    () => filters.filter((d) => d.to === componentId),
    [filters, componentId]
  );
};
