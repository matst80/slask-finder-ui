import { useState } from "react";
import { useTranslations } from "../lib/hooks/useTranslations";
import { StoreWithStock } from "./ItemDetails";
import { Store } from "../lib/types";

const toTime = ([hour,minute]: [number, number, number]) => {
  return `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`;
}

const OpenHours = ({ openHours }: Pick<Store, "openHours">) => {
  const dayIdx = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const today = openHours.days[dayIdx]
  if (!today) return <div className="mt-1 text-sm text-gray-600">Closed today</div>;
  const currentHour = new Date().getHours();
  const [opens, closes] = today;
  const isOpen = currentHour >= opens[0] && currentHour < closes[0];
  if (isOpen) {
    return <div className="mt-1 text-sm text-green-600 font-medium">Open now - closes at {toTime(closes)}</div>;
  }
  if (currentHour < opens[0]) {
    return <div className="mt-1 text-sm text-gray-600">Closed now - opens at {toTime(opens)}</div>;
  }
  if (currentHour >= closes[0]) {
    const nextDayIdx = (dayIdx + 1) % 7;
    const nextDay = openHours.days[nextDayIdx];
    if (nextDay) {
      return <div className="mt-1 text-sm text-gray-600">Opens tomorrow at {toTime(nextDay[0])}</div>;
    }
    return <div className="mt-1 text-sm text-gray-600">Closed now</div>;
  }
  return <span>{toTime(opens)} - {toTime(closes)}</span>;
}

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
          <OpenHours openHours={store.openHours} />
          {/* <JsonView data={store}  /> */}
        </div>
      )}
    </li>
  );
};
