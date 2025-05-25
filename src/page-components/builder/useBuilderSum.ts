"use client";
import { useMemo } from "react";
import { useBuilderContext } from "./useBuilderContext";

export const useBuilderSum = () => {
  const { selectedItems } = useBuilderContext();
  return useMemo(
    () =>
      selectedItems.reduce(
        (sum, d) =>
          sum + (d.values[4] ? Number(d.values[4]) : 0) * (d.quantity ?? 1),
        0
      ) / 100,
    [selectedItems]
  );
};
