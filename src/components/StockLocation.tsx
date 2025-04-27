import { useTranslations } from "../lib/hooks/useTranslations";
import { StoreWithStock } from "./ItemDetails";

export const StockLocation = ({
  stock,
  distance,
  ...store
}: StoreWithStock) => {
  const t = useTranslations();
  return (
    <li
      key={store.id}
      className="flex items-center py-2 px-3 hover:bg-gray-50 gap-2"
    >
      <div className="flex items-center gap-2 grow">
        <span className="font-medium line-clamp-1 text-ellipsis">
          {store.name}
        </span>
        <span className="text-gray-500">•</span>
        <span className="text-green-600 font-medium">
          {t("stock.nr", { stock })}
        </span>
      </div>
      {distance != null && (
        <span className="text-gray-500 text-sm">
          {t("stock.distance", { distance: distance.toFixed(0) })}
        </span>
      )}
    </li>
  );
};
