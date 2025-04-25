import { Plus, RefreshCw } from "lucide-react";
import { ResultItemInner } from "../../components/ResultItem";
import { Button, ButtonLink } from "../../components/ui/button";
import { trackClick } from "../../lib/datalayer/beacons";
import { useImpression } from "../../lib/hooks/useImpression";
import { ItemWithComponentId } from "./builder-types";
import { useBuilderContext } from "./useBuilderContext";
import { Link } from "react-router-dom";

export const SelectedComponentItem = ({
  componentId,
  position,
  quantity = 1,
  maxQuantity,
  ...item
}: ItemWithComponentId & { position: number; maxQuantity: number }) => {
  const { setSelectedItems } = useBuilderContext();
  const { watch } = useImpression();

  const trackItem = () => trackClick(item.id, position);

  return (
    <Link
      ref={watch({ id: Number(item.id), position })}
      to={`/product/${item.id}`}
      key={`item-${item.id}`}
      className="group bg-white md:shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden relative snap-start flex-1 min-w-64 flex flex-col result-item hover:bg-linear-to-br hover:from-white hover:to-gray-50 border-b border-gray-200 md:border-b-0"
      onClick={trackItem}
    >
      <ResultItemInner {...item}>
        {quantity < maxQuantity && (
          <Button
            variant="default"
            size="icon"
            className="absolute bottom-3 right-3"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItems((prev) => {
                const newItems = [...prev];
                const index = newItems.findIndex(
                  (i) => i.componentId === componentId
                );
                if (index !== -1) {
                  newItems[index].quantity = quantity + 1;
                }
                return newItems;
              });
            }}
          >
            <Plus className="size-5" />
          </Button>
        )}
        <span className="text-lg absolute top-3 left-3">x{quantity}</span>
        <ButtonLink
          to={`/builder/component/${componentId}`}
          variant="secondary"
          size="icon"
          className="absolute top-3 right-3"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <RefreshCw className="size-5" />
        </ButtonLink>
      </ResultItemInner>
    </Link>
  );
};
