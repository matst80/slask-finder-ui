"use client";
import { useMemo } from "react";
import { useBuilderContext } from "./useBuilderContext";

export const useBuilderPercentDone = () => {
  const { selectedItems, rules } = useBuilderContext();
  return useMemo(
    () =>
      Math.min(
        Math.round((selectedItems.length / (rules.length - 1)) * 100),
        100
      ),
    [selectedItems, rules]
  );
};
