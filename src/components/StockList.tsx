import { useMemo } from "react";
import { stores } from "../lib/datalayer/stores";
import { StockData } from "../lib/types";
import { isDefined } from "../utils";
import { StockLocation } from "./StockLocation";
import { useGeoLocation } from "./useGeoLocation";
import { calculateDistance } from "./map-utils";
import { useTranslations } from "../lib/hooks/useTranslations";

export const StockList = ({ stock, stockLevel }: StockData) => {
  const location = useGeoLocation();
  const t = useTranslations();
  const storesWithStock = useMemo(() => {
    return Object.entries(stock ?? {})
      .map(([id, value]) => {
        const store = stores.find((store) => store.id === id);
        if (!store) return null;
        return {
          ...store,
          stock: value,
          distance:
            location != null
              ? calculateDistance(location, store.address.location)
              : null,
        };
      })
      .filter(isDefined)
      .sort((a, b) =>
        location != null
          ? a.distance! - b.distance!
          : a.displayName.localeCompare(b.displayName)
      );
  }, [stock, location]);
  if (stock == null) return null;
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col flex-1">
      <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
        <h3 className="text-lg font-semibold">{t("stock.level")}</h3>
        {stockLevel != null && stockLevel !== "0" && (
          <p className="text-gray-600 mt-1">
            {t("stock.in_stock_online", { stockLevel })}
          </p>
        )}
      </div>

      <div className="overflow-y-auto flex-1 max-h-80">
        <ul className="border-t border-gray-200 divide-y divide-gray-200">
          {storesWithStock.map((s) => (
            <StockLocation key={s.id} {...s} />
          ))}
        </ul>
      </div>
    </div>
  );
};
