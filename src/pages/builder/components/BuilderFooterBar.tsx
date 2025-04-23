import { PropsWithChildren } from "react";
import { useBuilderContext } from "../useBuilderContext";
import { Button } from "../../../components/ui/button";

export const BuilderFooterBar = ({ children }: PropsWithChildren) => {
  const { sum, neededPsuWatt, percentDone, setSelectedItems } =
    useBuilderContext();
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
            <span className="font-headline text-2xl sm:text-3xl font-bold ml-auto sm:ml-0">
              {sum}.-
            </span>
          </div>

          {/* Build progress indicator */}
          <div className="hidden lg:block text-lg font-bold font-elkjop uppercase tracking-tight">
            <span className="text-black">Ditt bygge&nbsp;</span>
            <span className="text-[#4a90e2]">{percentDone}% klart</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 w-full sm:w-auto">
            {children}
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => setSelectedItems([])}
            >
              Börja om
            </Button>
            <Button variant="default" className="flex-1 sm:flex-none">
              Lägg till i kundvagn
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};
