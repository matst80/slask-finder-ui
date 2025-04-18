import { Item } from "../lib/types";
import { makeImageUrl } from "../utils";
import { Price } from "./Price";
import { Stars } from "./Stars";

import { useState } from "react";
import { trackClick } from "../lib/datalayer/beacons";
import { Link } from "react-router-dom";
import { useQuery } from "../lib/hooks/QueryProvider";
import { useImpression } from "../lib/hooks/ImpressionProvider";
import { TimeAgo } from "./TimeAgo";

export const StockIndicator = ({
  stock,
  stockLevel,
}: Pick<Item, "stock" | "stockLevel">) => {
  const {
    query: { stock: stockQuery },
  } = useQuery();
  const locationId = stockQuery?.[0];
  const stockOnLocation = locationId != null ? stock?.[locationId] : null;
  const storesWithStock = Object.entries(stock ?? {}).length;

  return (
    <span className="inline-flex items-center gap-1">
      {locationId != null ? (
        <span
          className={`text-sm ${
            stockOnLocation != null ? "text-green-500" : "text-yellow-500"
          }`}
        >
          {stockOnLocation != null
            ? `I din butik: ${stockOnLocation}`
            : "Slut i din butik"}
        </span>
      ) : (
        <button
          className={`text-sm relative line-clamp-1 ${
            storesWithStock > 0 ? "text-green-500" : "text-yellow-500"
          }`}
        >
          Finns i {storesWithStock} butiker
        </button>
      )}

      <span
        className={`text-sm ${
          stockLevel != null && stockLevel != "0"
            ? "text-green-500"
            : "text-yellow-500"
        }`}
      >
        {stockLevel != null && stockLevel != "0"
          ? `Online: ${stockLevel}`
          : "Inte i lager"}
      </span>
    </span>
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

const ImageWithPlaceHolder = ({ img, title }: Pick<Item, "img" | "title">) => {
  const [loaded, setLoaded] = useState(false);
  if (img == null) {
    return (
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400">{title}</span>
      </div>
    );
  }
  return (
    <div className="relative w-full h-48 px-2">
      {img != null && (
        <img
          className={`w-full h-48 transition-all object-contain top-0 left-0 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          src={makeImageUrl(img)}
          alt={title}
          onLoad={() => setLoaded(true)}
        />
      )}
      {!loaded && (
        <div className="flex items-center justify-center w-full h-48 absolute top-0 left-0"></div>
      )}
    </div>
  );
};

export const ResultItemInner = ({
  title,
  img,
  badgeUrl,
  values,
  stock,
  bp,
  stockLevel,
  lastUpdate,
  disclaimer,
  advertisingText,
}: Item) => {
  const hasRating = values["6"] != null && values["7"] != null;
  const soldBy = values["9"];
  return (
    <>
      <div className="mt-2">
        <ImageWithPlaceHolder img={img} title={title} />

        {badgeUrl != null && (
          <img
            src={makeImageUrl(badgeUrl)}
            alt={title}
            className="size-16 object-contain absolute top-4 right-4"
          />
        )}
        {values["10"] == "Outlet" && (
          <img
            className="size-16 object-contain absolute top-4 left-4"
            src="https://www.elgiganten.se/content/SE/outlet/outlet.svg"
          />
        )}
      </div>
      <div className="p-4 pt-0">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        {hasRating && (
          <Stars
            rating={Number(values["6"]) / 10}
            numberOfRatings={Number(values["7"])}
          />
        )}
        {lastUpdate != null && lastUpdate > 0 && (
          <span className="text-xs bg-yellow-200 rounded-md px-2 py-1">
            <TimeAgo ts={lastUpdate} />
          </span>
        )}
        <div className="flex items-center gap-2 mt-2">
          <StockIndicator stock={stock} stockLevel={stockLevel} />
        </div>
        <ul className="text-sm">
          {bp
            ?.split("\n")
            .filter((d) => d?.length)
            .map((bp, idx) => (
              <li
                key={`${bp}-${idx}`}
                className="line-clamp-1 overflow-ellipsis"
              >
                {bp}
              </li>
            ))}
        </ul>

        <Price size="large" values={values} disclaimer={disclaimer} />

        {/* <CompatibleButton values={values} /> */}
        {advertisingText != null && (
          <em className="italic text-xs">{advertisingText}</em>
        )}
        {values["10"] == "Outlet" && values["20"] != null && (
          <em className="italic text-xs">{values["20"]}</em>
        )}
        {soldBy != null && soldBy != "Elgiganten" && (
          <em className="italic text-xs">Säljs av: {soldBy}</em>
        )}
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

export const ResultItem = ({
  position,
  ...item
}: Item & {
  position: number;
}) => {
  //return <DataView item={item} />;
  const { watch } = useImpression();
  const trackItem = () => {
    trackClick(item.id, position);
  };

  return (
    <Link
      ref={(r) => r != null && watch(r, { id: Number(item.id), position })}
      to={`/product/${item.id}`}
      key={`item-${item.id}`}
      className={`bg-white rounded-sm shadow overflow-hidden relative snap-start flex-1 min-w-64 flex flex-col result-item`}
      onClick={trackItem}
    >
      <ResultItemInner {...item} />
      {/* <DataView item={item} /> */}
    </Link>
  );
};
