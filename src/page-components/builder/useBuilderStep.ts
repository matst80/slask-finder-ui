"use client";
import { useMemo } from "react";
import { useBuilderContext } from "./useBuilderContext";
import { isDefined } from "../../utils";
import { Rule, RuleId } from "./builder-types";

export const useBuilderStep = (componentId?: RuleId) => {
  const { selectedItems, order, rules } = useBuilderContext();

  return useMemo(() => {
    const currentIdx = order.findIndex((id) => id === componentId);

    const selectedIds = new Set<RuleId>([
      ...selectedItems.flatMap((d) =>
        [d.componentId, d.parentId].filter(isDefined)
      ),
      ...rules
        .filter((d) => d.disabled != null && d.disabled(selectedItems))
        .map((d) => d.id),
    ]);

    const unselected = order
      .filter((id) => {
        return !selectedIds.has(id);
      })
      .map((id) => {
        const rule = rules.find((d) => d.id === id);
        return rule != null &&
          (rule.disabled == null || !rule.disabled(selectedItems))
          ? rule
          : null;
      })
      .filter(isDefined);

    return [
      unselected,
      rules.find(
        (d) =>
          d.id ==
          order.find(
            (id, idx) =>
              id !== componentId && !selectedIds.has(id) && idx > currentIdx
          )
      ) ?? unselected[0],
    ] as [Rule[], Rule | undefined];
  }, [order, componentId, selectedItems, rules]);
};
