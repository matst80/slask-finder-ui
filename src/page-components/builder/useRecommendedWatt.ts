import { useMemo } from "react";
import { asNumber } from "./builder-utils";
import { GPU } from "./rules";
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
        return [35990, 32186].reduce((acc, id) => {
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
