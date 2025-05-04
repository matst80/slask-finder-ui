import { Item } from "../lib/types";
import { makeImageUrl } from "../utils";
import { Price } from "./Price";
import { Stars } from "./Stars";
import { PropsWithChildren, useMemo, useState } from "react";
import { Link, useViewTransitionState } from "react-router-dom";
import { useQuery } from "../lib/hooks/useQuery";
import { useImpression } from "../lib/hooks/useImpression";
import { TimeAgo } from "./TimeAgo";
import { useTranslations } from "../lib/hooks/useTranslations";
import { toEcomTrackingEvent } from "./toImpression";
import { useTracking } from "../lib/hooks/TrackingContext";
import { useCompareContext } from "../lib/hooks/CompareProvider";
import { Button } from "./ui/button";
import { GitCompareArrows } from "lucide-react";

const hasStock = (value?: string | null) => {
  return value != null && value != "0";
};

export const StockBalloon = ({
  stock,
  stockLevel,
}: Pick<Item, "stock" | "stockLevel">) => {
  const hasStoreStock = Object.entries(stock ?? {}).length > 0;
  const hasOnlineStock = hasStock(stockLevel);
  return (
    <div
      className={`size-2 rounded-full aspect-square ${
        hasStoreStock || hasOnlineStock ? "bg-green-500" : "bg-amber-500"
      }`}
    />
  );
};

export const StockIndicator = ({
  stock,
  stockLevel,
  showOnlyInStock = false,
}: Pick<Item, "stock" | "stockLevel"> & { showOnlyInStock?: boolean }) => {
  const t = useTranslations();
  const {
    query: { stock: stockQuery },
  } = useQuery();
  const locationId = stockQuery?.[0];
  const stockOnLocation = locationId != null ? stock?.[locationId] : null;
  const storesWithStock = Object.entries(stock ?? {}).length;
  const hasStoreStock =
    stockOnLocation != null ? hasStock(stockOnLocation) : storesWithStock > 0;
  const hasOnlineStock = hasStock(stockLevel);

  if (showOnlyInStock && !hasOnlineStock && !hasStoreStock) {
    return null;
  }

  return (
    <>
      {locationId != null ? (
        <span
          className={`inline-flex items-center line-clamp-1 text-ellipsis  gap-1.5 text-sm font-medium ${
            hasStoreStock ? "text-green-600" : "text-amber-600"
          }`}
        >
          <span
            className={`size-2 rounded-full ${
              stockOnLocation != null ? "bg-green-500" : "bg-amber-500"
            }`}
          />
          {stockOnLocation != null
            ? t("stock.in_your_store", { stock: stockOnLocation })
            : t("stock.out_of_stock_in_store")}
        </span>
      ) : (
        (!showOnlyInStock || hasStoreStock) && (
          <span
            className={`inline-flex line-clamp-1 text-ellipsis items-center gap-1.5 text-sm font-medium relative ${
              hasStoreStock ? "text-green-600" : "text-amber-600"
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                hasStoreStock ? "bg-green-500" : "bg-amber-500"
              }`}
            />
            {t("stock.stores_with_stock", { count: storesWithStock })}
          </span>
        )
      )}

      {showOnlyInStock && !hasOnlineStock ? null : (
        <span
          className={`inline-flex items-center gap-1.5 text-sm font-medium ${
            hasOnlineStock ? "text-green-600" : "text-amber-600"
          }`}
        >
          <span
            className={`size-2 rounded-full ${
              hasOnlineStock ? "bg-green-500" : "bg-amber-500"
            }`}
          />
          {hasOnlineStock
            ? t("stock.online_stock", { stock: stockLevel })
            : t("stock.not_in_stock")}
        </span>
      )}
    </>
  );
};

// const UpdatedBanner = ({ lastUpdate }: Pick<Item, "lastUpdate">) => {
//   const recentlyUpdated = useMemo(
//     () => (lastUpdate ?? 0) > Date.now() - 1000 * 60 * 60,
//     [lastUpdate]
//   );
//   return recentlyUpdated ? (
//     <div className="flex items-center rounded-bl-md p-1 bg-yellow-300 text-xs gap-2 absolute top-0 right-0">
//       <Zap size={18} />
//       <TimeAgo ts={lastUpdate} />
//     </div>
//   ) : null;
// };

const ImageWithPlaceHolder = ({
  img,
  isTransitioning,
  title,
}: Pick<Item, "img" | "title"> & { isTransitioning: boolean }) => {
  const [loaded, setLoaded] = useState(false);
  if (img == null) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <span className="text-gray-400 text-sm">{title}</span>
      </div>
    );
  }
  return (
    <div className="relative w-full h-48">
      {img != null && (
        <img
          className={`w-full h-full transition-all group-hover:scale-110 duration-300 object-contain mix-blend-multiply ${
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          src={makeImageUrl(img)}
          alt={title}
          style={{
            viewTransitionName: isTransitioning ? "product-image" : "none",
          }}
          onLoad={() => setLoaded(true)}
        />
      )}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export const ResultItemInner = ({
  transitionUrl,
  ...item
}: PropsWithChildren<Item> & { transitionUrl?: string }) => {
  const {
    title,
    img,
    badgeUrl,
    values,
    stock,
    id,
    children,
    bp,
    stockLevel,
    lastUpdate,
    disclaimer,
    advertisingText,
  } = item;
  const { setItems } = useCompareContext();
  const hasRating = values?.["6"] != null && values?.["7"] != null;
  const soldBy = values?.["9"];
  const isTransitioning = useViewTransitionState(
    transitionUrl ?? `/product/${id}`
  );
  return (
    <>
      <div className="relative pt-4 px-4">
        <ImageWithPlaceHolder
          img={img}
          title={title}
          isTransitioning={isTransitioning}
        />

        {badgeUrl != null && (
          <img
            src={makeImageUrl(badgeUrl)}
            alt={title}
            className="size-16 object-contain absolute top-4 right-4 drop-shadow-lg"
          />
        )}
        {values?.["10"] == "Outlet" && (
          <img
            className="size-16 object-contain absolute top-4 left-4 drop-shadow-lg"
            src="https://www.elgiganten.se/content/SE/outlet/outlet.svg"
          />
        )}
      </div>
      <div className="p-4 space-y-1">
        <h2
          className="text-lg font-semibold leading-tight text-gray-900 hover:text-blue-600 transition-colors"
          style={{
            viewTransitionName: isTransitioning ? "product-name" : "none",
          }}
        >
          {title}
        </h2>

        <div className="flex flex-wrap justify-between gap-2">
          {hasRating && (
            <Stars
              rating={Number(values?.["6"]) / 10}
              numberOfRatings={Number(values?.["7"])}
            />
          )}
          {lastUpdate != null && lastUpdate > 0 && (
            <span className="text-sm inline-block align-top bg-gray-100 rounded-bl-none after:absolute after:left-0 after:box-content after:border-transparent forced-colors:border forced-colors:after:hidden after:border-l-gray-100 rounded-border px-2 py-0.5 after:-bottom-[7px] after:border-[7px] absolute left-0 top-0 z-1">
              <TimeAgo ts={lastUpdate} />
            </span>
          )}
        </div>

        {bp && (
          <ul className="text-sm text-gray-600 space-y-1">
            {bp
              .split("\n")
              .filter((d) => d?.length)
              .map((bp, idx) => (
                <li key={`${bp}-${idx}`} className="line-clamp-1 text-ellipsis">
                  {bp}
                </li>
              ))}
          </ul>
        )}

        <div className="pt-2">
          <Price size="large" values={values} disclaimer={disclaimer} />
          {advertisingText != null && (
            <em className="block text-xs text-gray-500 italic">
              {advertisingText}
            </em>
          )}
        </div>

        {children}

        {values?.["10"] == "Outlet" && values?.["20"] != null && (
          <em className="block text-xs text-gray-500 italic">{values["20"]}</em>
        )}
        {soldBy != null && soldBy != "Elgiganten" && (
          <em className="block text-xs text-gray-500 italic">
            Säljs av: {soldBy}
          </em>
        )}
      </div>
      <button
        className="absolute top-3 right-3 text-blue-400 hover:bg-gray-100 p-1 rounded-sm text-shadow transition-all"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setItems((prev) => {
            const newItems = [...prev];
            const index = newItems.findIndex((item) => item.id === id);
            if (index !== -1) {
              newItems.splice(index, 1);
            } else {
              newItems.push(item);
            }
            return newItems;
          });
        }}
      >
        <GitCompareArrows className="size-5" />
      </button>
      <div className="mb-0 mt-auto px-4 pb-3 flex gap-1 justify-between">
        <StockIndicator stock={stock} stockLevel={stockLevel} showOnlyInStock />
      </div>
    </>
  );
};

const Value = ({ value }: { value: unknown }) => {
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-col gap-2">
        {value.map((v, i) => (
          <Value key={i} value={v} />
        ))}
      </div>
    );
  }
  if (typeof value === "object") {
    return (
      <div className="flex flex-col gap-2 pl-2">
        {Object.entries(value ?? {}).map(([key, val]) => (
          <DataProperty key={key} title={key} value={val} />
        ))}
      </div>
    );
  }
  return <>{String(value)}</>;
};

const DataProperty = ({ title, value }: { title: string; value: unknown }) => {
  if (value == null) {
    return null;
  }

  return (
    <details className="text-sm font-semibold" open={typeof value !== "object"}>
      <summary>{title}</summary>
      <Value value={value} />
    </details>
  );
};

export const DataView = ({ item }: { item: Item }) => {
  return <Value value={item} />;
};

export const PlaceholderItem = () => {
  return (
    <Link
      to={`#`}
      className="group bg-white md:shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden animating-element relative snap-start flex-1 min-w-64 flex flex-col result-item hover:bg-linear-to-br hover:from-white hover:to-gray-50 border-b border-gray-200 md:border-b-0"
    >
      <div className="min-h-[465px]"></div>
    </Link>
  );
};

export const ResultItem = ({
  position,
  ...item
}: Item & {
  position: number;
}) => {
  const { watch } = useImpression();
  const { track } = useTracking();
  const ecomItem = useMemo(
    () => toEcomTrackingEvent(item, position),
    [item, position]
  );

  return (
    <Link
      ref={watch(ecomItem)}
      to={`/product/${item.id}`}
      key={`item-${item.id}`}
      viewTransition={true}
      className="group bg-white md:shadow-xs hover:shadow-md transition-all hover:z-10 duration-300 animating-element relative snap-start flex-1 min-w-64 flex flex-col result-item hover:bg-linear-to-br hover:from-white hover:to-gray-50 border-b border-gray-200 md:border-b-0"
      onClick={() => track({ type: "click", item: ecomItem })}
    >
      <ResultItemInner {...item} />
      {/* <DataView item={item} /> */}
    </Link>
  );
};
