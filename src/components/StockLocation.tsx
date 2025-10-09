import { useState } from "react";
import { useTranslations } from "../lib/hooks/useTranslations";
import { StoreWithStock } from "./ItemDetails";

export const StockLocation = ({
  stock,
  distance,
  ...store
}: StoreWithStock) => {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  return (
    <li
      key={store.id}
      className="hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex items-center py-2 px-3 gap-2" onClick={() => setOpen(!open)}>
      <span className="font-medium line-clamp-1 text-ellipsis flex-1">
        {store.displayName}
      </span>
        
        
      
      {stock != "0" && <span className="text-green-600 font-medium flex-shrink-0">
          {t("stock.nr", { stock })}
        </span>}
      {distance != null && (
        <span className="text-gray-500 text-sm flex-shrink-0">
          {t("stock.distance", { distance: distance.toFixed(0) })}
        </span>
      )}
      </div>
      {open && (
        <div className="px-3 py-2 text-sm text-gray-600">
          {store.address.street}, {store.address.zip} {store.address.city}
          
        </div>
      )}
    </li>
  );
};
