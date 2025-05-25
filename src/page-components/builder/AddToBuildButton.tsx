"use client";
import { toEcomTrackingEvent } from "../../components/toImpression";
import { Button } from "../../components/ui/button";
import { trackAction } from "../../lib/datalayer/beacons";
import { useTracking } from "../../lib/hooks/TrackingContext";
import { useTranslations } from "../../lib/hooks/useTranslations";
import { Item } from "../../lib/types";
import {
  SelectionId,
  ComponentId,
  isParentId,
  ItemWithComponentId,
} from "./builder-types";
import { useBuilderContext } from "./useBuilderContext";

export const AddToBuildButton = ({
  itemParentId,
  id,
  details,
  componentId,
}: {
  itemParentId?: SelectionId;
  id: number;
  details: Item;
  componentId: ComponentId;
}) => {
  const t = useTranslations();
  const { setSelectedItems, selectedItems } = useBuilderContext();
  const { track } = useTracking();
  const queryParentId =
    new URLSearchParams(globalThis.location?.search).get("parentId") ??
    undefined;
  const parentId = isParentId(queryParentId) ? queryParentId : itemParentId;
  const isSelected = selectedItems.some((d) => d.id === id);

  return (
    <Button
      variant={isSelected ? "outline" : "default"}
      onClick={() => {
        setSelectedItems((prev) => [
          ...prev.filter((d) =>
            parentId == null
              ? d.componentId != componentId
              : d.parentId != parentId
          ),
          ...(isSelected
            ? []
            : [
                {
                  ...details,
                  parentId,
                  componentId,
                } satisfies ItemWithComponentId,
              ]),
        ]);
        requestAnimationFrame(() => {
          const ecomItem = toEcomTrackingEvent(details, 1);
          track({
            type: "click",
            item: ecomItem,
          });
          //trackClick(id, 1);
          trackAction({
            item: ecomItem,
            action: "select_component",
            reason: `builder_${componentId}`,
          });
        });
      }}
    >
      {t(isSelected ? "builder.remove" : "builder.select")}
    </Button>
  );
};
