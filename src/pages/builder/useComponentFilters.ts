import { useMemo } from "react";
import { SelectedAdditionalFilter } from "./builder-types";
import { asNumber } from "./builder-utils";
import { GPU, CPU } from "./rules";
import { useBuilderContext } from "./useBuilderContext";

export const useRecommendedWatt = () => {
  const { selectedItems } = useBuilderContext();
  return useMemo(() => {
    let gpuRecommendedWatt = 0;
    const allSum = selectedItems
      .map((item) => {
        if (item.componentId === GPU && item.values[32186] != null) {
          gpuRecommendedWatt = asNumber(item.values[32186]);
        }
        return [35990, 32186, 35990].reduce((acc, id) => {
          const value = item.values[id];
          if (value != null) {
            const nr = asNumber(value);
            if (!isNaN(nr) && nr > acc) {
              return nr;
            }
          }
          return acc;
        }, 0);
      })
      .reduce((sum, d) => sum + d, 0);
    return !isNaN(gpuRecommendedWatt) && gpuRecommendedWatt > 0
      ? gpuRecommendedWatt
      : allSum;
  }, [selectedItems]);
};

export const useBuilderFilters = (): SelectedAdditionalFilter[] => {
  const { selectedItems, components } = useBuilderContext();
  const neededPsuWatt = useRecommendedWatt();

  return useMemo(() => {
    const wattQueries =
      neededPsuWatt > 500
        ? [
            {
              to: 6,
              id: 31986,
              from: neededPsuWatt > 300 ? GPU : CPU,
              value: { min: neededPsuWatt, max: 3000 },
            },
          ]
        : [];
    return [
      ...wattQueries,
      ...selectedItems.flatMap((item) =>
        components[item.componentId]?.filtersToApply.flatMap((f) => {
          if (f.converter) {
            const converted = f.converter(item.values);

            return converted !== undefined
              ? converted.map((d) => ({
                  ...d,
                  to: f.to,
                  from: item.componentId,
                }))
              : [];
          }
          const value = item.values?.[f.id];

          return typeof value === "string"
            ? [{ id: f.id, to: f.to, value, from: item.componentId }]
            : [];
        })
      ),
    ];
  }, [selectedItems, neededPsuWatt, components]);
};

export const useComponentFilters = (
  componentId: number
): SelectedAdditionalFilter[] => {
  const filters = useBuilderFilters();

  return useMemo(
    () => filters.filter((d) => d.to === componentId),
    [filters, componentId]
  );
};
