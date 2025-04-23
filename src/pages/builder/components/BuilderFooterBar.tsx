import { PropsWithChildren } from "react";
import { useBuilderContext } from "../useBuilderContext";
import { Button, ButtonLink } from "../../../components/ui/button";
import { useAddMultipleToCart } from "../../../hooks/cartHooks";
import { Link } from "react-router-dom";

export const BuilderFooterBar = ({ children }: PropsWithChildren) => {
  const { sum, neededPsuWatt, percentDone, setSelectedItems, selectedItems } =
    useBuilderContext();
  const { trigger: addToCart, isMutating } = useAddMultipleToCart();
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
          {/* Price information */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex flex-col">
              <h2 className="text-gray-700 font-medium">Summa:</h2>
              <span className="text-xs text-gray-500">
                Min PSU: {neededPsuWatt}w
              </span>
            </div>
            <span className="text-2xl sm:text-3xl font-bold ml-auto sm:ml-0">
              {sum}.-
            </span>
          </div>

          {/* Build progress indicator */}
          <Link
            to="/builder/overview"
            className="hidden lg:block text-lg font-bold font-elkjop uppercase tracking-tight"
          >
            <span className="text-black">Ditt bygge&nbsp;</span>
            <span className="text-[#4a90e2]">{percentDone}% klart</span>
          </Link>

          {/* Action buttons */}
          <div className="flex gap-3 w-full sm:w-auto">
            {children}
            <ButtonLink
              variant="danger"
              to={"/builder"}
              className="flex-1 sm:flex-none"
              onClick={() => setSelectedItems([])}
            >
              Börja om
            </ButtonLink>
            <Button
              variant="default"
              disabled={isMutating}
              className="flex-1 sm:flex-none"
              onClick={async () => {
                addToCart(selectedItems);
              }}
            >
              Lägg till i kundvagn
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};
