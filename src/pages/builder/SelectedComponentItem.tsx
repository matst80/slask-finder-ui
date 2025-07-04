import { RefreshCw } from "lucide-react";
import { ResultItemInner } from "../../components/ResultItem";
import { Button } from "../../components/ui/button";
import { useImpression } from "../../lib/hooks/useImpression";
import { ItemWithComponentId } from "./builder-types";
import { useBuilderContext } from "./useBuilderContext";
import { Link, useNavigate } from "react-router-dom";
import { QuantityInput } from "./QuantityInput";
import { cm } from "../../utils";
import { toEcomTrackingEvent } from "../../components/toImpression";
import { useTracking } from "../../lib/hooks/TrackingContext";
import { useMemo } from "react";

export const SelectedComponentItem = ({
  componentId,
  position,
  quantity = 1,
  maxQuantity,
  ...item
}: ItemWithComponentId & { position: number; maxQuantity: number }) => {
  const { setSelectedItems } = useBuilderContext();
  const { watch } = useImpression();
  const navigate = useNavigate();
  const { track } = useTracking();
  const ecomItem = useMemo(
    () => toEcomTrackingEvent(item, position),
    [item, position]
  );
  const trackItem = () => track({ type: "click", item: ecomItem });

  const setQuantity = (value: number) =>
    setSelectedItems((prev) =>
      prev.flatMap((i) => {
        if (i.id === item.id) {
          return value > 0
            ? [
                {
                  ...i,
                  quantity: value,
                },
              ]
            : [];
        }
        return [i];
      })
    );

  return (
    <Link
      ref={watch(ecomItem)}
      to={`/builder/product/${componentId}/${item.id}`}
      key={`item-${item.id}`}
      className="group bg-white md:shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden relative snap-start flex-1 min-w-64 flex flex-col result-item hover:bg-linear-to-br hover:from-white hover:to-gray-50 border-b border-gray-200 md:border-b-0"
      onClick={trackItem}
    >
      <ResultItemInner {...item} hideCompare>
        <QuantityInput
          value={quantity}
          onChange={setQuantity}
          maxQuantity={maxQuantity}
          className={cm(
            "bottom-12 right-3 absolute",
            quantity < maxQuantity ? "animate-focus" : "animate-pop"
          )}
        />

        <Button
          variant="secondary"
          size="icon"
          title="Change component"
          className="absolute top-3 right-3"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            navigate(`/builder/component/${componentId}`);
          }}
        >
          <RefreshCw className="size-5" />
        </Button>
      </ResultItemInner>
    </Link>
  );
};
