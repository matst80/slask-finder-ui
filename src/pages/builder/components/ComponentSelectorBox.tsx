import { CheckCheckIcon } from "lucide-react";
import { ItemWithComponentId } from "../builder-types";
import { cm, makeImageUrl } from "../../../utils";

type ComponentSelectorBoxProps = {
  onClick: () => void;
  id: number;
  title: string;
  selected: ItemWithComponentId | undefined;
  isActive: boolean;
};

export const ComponentSelectorBox = ({
  onClick,
  title,
  id,
  selected,
  isActive,
}: ComponentSelectorBoxProps) => {
  // Format price to show with proper currency format
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100);
  };

  return (
    <button
      onClick={onClick}
      data-id={String(id)}
      aria-selected={isActive}
      className={cm(
        "p-3 cursor-pointer text-left transition-all duration-300 flex-1 rounded-md shadow-sm hover:shadow-md flex-shrink-0",
        "min-w-[300px] overflow-hidden",
        selected ? "bg-gray-50" : "bg-white",
        isActive
          ? "border-blue-600 border-2 ring-2 ring-blue-100"
          : "border-gray-200 border hover:border-gray-300"
      )}
    >
      {selected ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-accent font-bold text-md">{title}</h2>
            <CheckCheckIcon className="text-accent size-5 text-blue-600" />
          </div>

          <div className="text-sm font-medium text-gray-800 truncate">
            {selected.title}
          </div>

          <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-200">
            <img
              width={40}
              height={40}
              src={makeImageUrl(selected.img)}
              alt={selected.title}
              className="size-10 object-contain mix-blend-multiply"
            />

            <div className="font-bold text-[1.125rem] tracking-wide text-blue-700">
              {formatPrice(selected.values[4])}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1 py-1">
          <div className="text-sm text-gray-500 font-medium">Välj</div>
          <h2 className="font-bold text-lg truncate text-gray-800">{title}</h2>
          <div className="text-xs text-gray-400 mt-1">Klicka för att välja</div>
        </div>
      )}
    </button>
  );
};
