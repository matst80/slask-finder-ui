import { RefreshCw } from "lucide-react";
import { ResultItemInner } from "../../components/ResultItem";
import { Button } from "../../components/ui/button";
import { trackClick } from "../../lib/datalayer/beacons";
import { useImpression } from "../../lib/hooks/useImpression";
import { ItemWithComponentId } from "./builder-types";
import { useBuilderContext } from "./useBuilderContext";
import { Link, useNavigate } from "react-router-dom";
import { QuantityInput } from "./QuantityInput";
import { cm } from "../../utils";

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
  const trackItem = () => trackClick(item.id, position);

  const setQuantity = (value: number) => {
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
  };

  return (
    <Link
      ref={watch({ id: Number(item.id), position })}
      to={`/builder/product/${componentId}/${item.id}`}
      key={`item-${item.id}`}
      className="group bg-white md:shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden relative snap-start flex-1 min-w-64 flex flex-col result-item hover:bg-linear-to-br hover:from-white hover:to-gray-50 border-b border-gray-200 md:border-b-0"
      onClick={trackItem}
    >
      <ResultItemInner {...item}>
        <QuantityInput
          value={quantity}
          onChange={setQuantity}
          maxQuantity={maxQuantity}
          className={"top-3 left-3 absolute animate-pop"}
        />

        <Button
          variant="secondary"
          size="icon"
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
