import { Link } from "react-router-dom";
import { ResultItemInner } from "../../components/ResultItem";
import { ButtonLink } from "../../components/ui/button";
import { ImpressionProvider } from "../../lib/hooks/ImpressionProvider";
import { useBuilderContext } from "./useBuilderContext";
import { useImpression } from "../../lib/hooks/useImpression";
import { trackClick } from "../../lib/datalayer/beacons";
import { ItemWithComponentId } from "./builder-types";
import { PriceValue } from "../../components/Price";
import { RefreshCw } from "lucide-react";

const SelectedItem = ({
  componentId,
  position,
  ...item
}: ItemWithComponentId & { position: number }) => {
  const { watch } = useImpression();
  const { setSelectedComponentId } = useBuilderContext();
  const trackItem = () => trackClick(item.id, position);

  return (
    <Link
      ref={watch({ id: Number(item.id), position })}
      to={`/product/${item.id}`}
      key={`item-${item.id}`}
      className="group bg-white md:shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative snap-start flex-1 min-w-64 flex flex-col result-item hover:bg-gradient-to-br hover:from-white hover:to-gray-50 border-b border-gray-200 md:border-b-0"
      onClick={trackItem}
    >
      <ResultItemInner {...item}>
        <ButtonLink
          to={`/builder/component/${componentId}`}
          variant="secondary"
          size="icon"
          className="absolute top-3 right-3"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponentId(componentId);
          }}
        >
          <RefreshCw className="size-5" />
        </ButtonLink>
      </ResultItemInner>
    </Link>
  );
};

export const BuilderOverview = () => {
  const { selectedItems, sum } = useBuilderContext();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl mb-6 font-bold">Builder Overview</h1>
      <p>Welcome to the Builder Overview page!</p>
      <p>This is where you can see an overview of your builder components.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ImpressionProvider>
          {selectedItems.map((item, i) => (
            <SelectedItem key={i} position={i} {...item} />
          ))}
        </ImpressionProvider>
      </div>
      <div className="my-6">
        <p className="font-bold text-lg">
          Total price: <PriceValue value={sum * 100} />
        </p>
      </div>
    </div>
  );
};
