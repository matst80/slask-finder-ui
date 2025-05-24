import { useMemo } from "react";
import { ComponentId, SelectedAdditionalFilter } from "./builder-types";
import { useBuilderFilters } from "./useBuilderFilters";
import { isDefined } from "../../utils";

export const useComponentFilters = (
  componentId?: ComponentId
): SelectedAdditionalFilter[] => {
  const filters = useBuilderFilters();

  return useMemo(
    () => filters.filter(isDefined).filter((d) => d.to === componentId),
    [filters, componentId]
  );
};
