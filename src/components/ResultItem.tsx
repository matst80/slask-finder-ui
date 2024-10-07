import { Zap } from "lucide-react";
import { getRawData, trackClick } from "../api";
import { Item } from "../types";
import { makeImageUrl } from "../utils";
import { PopularityOverride } from "./PopularityOverride";
import { Price } from "./Price";
import { Stars } from "./Stars";
import { TimeAgo } from "./TimeAgo";
import { useMemo, useState } from "react";
import { useHashQuery } from "../searchHooks";
import { useDetails } from "../appState";

const StockIndicator = ({
  stock,
  stockLevel,
}: Pick<Item, "stock" | "stockLevel">) => {
  const {
    query: { stock: stockQuery },
  } = useHashQuery();
  const locationId = stockQuery?.[0];
  const stockOnLocation = stock?.find((d) => d.id === locationId);
  const storesWithStock = stock?.length ?? 0;

  return (
    <>
      {locationId != null ? (
        <span
          className={`text-sm ${
            stockOnLocation != null ? "text-green-500" : "text-yellow-500"
          }`}
        >
          {stockOnLocation != null
            ? `I din butik: ${stockOnLocation.level}`
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
      )}{" "}
      |{" "}
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
    </>
  );
};

const UpdatedBanner = ({ lastUpdate }: Pick<Item, "lastUpdate">) => {
  const recentlyUpdated = useMemo(
    () => (lastUpdate ?? 0) > Date.now() - 1000 * 60 * 60,
    [lastUpdate]
  );
  return recentlyUpdated ? (
    <div className="flex items-center rounded-bl-md p-1 bg-yellow-300 text-xs gap-2 absolute top-0 right-0">
      <Zap size={18} />
      <TimeAgo ts={lastUpdate} />
    </div>
  ) : null;
};

const ImageWithPlaceHolder = ({ img, title }: Pick<Item, "img" | "title">) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-48">
      {img != null && (
        <img
          className={`w-full h-48 object-contain top-0 left-0 ${
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

export const ResultItem = ({
  id,
  title,
  img,
  badgeUrl,
  values,
  stock,
  url,
  bp,
  lastUpdate: updated,
  position,
  stockLevel,
  disclaimer,
  advertisingText,
}: Item & {
  position: number;
}) => {
  const [_, setDetails] = useDetails();
  const doTrackClick = () => {
    trackClick(id, position);
    getRawData(id).then((data) => {
      console.log(data);
      setDetails(data);
    });
  };

  const hasRating = values["6"] != null && values["7"] != null;
  const soldBy = values["9"];
  return (
    <div
      key={`item-${id}`}
      className={`bg-white rounded-sm shadow overflow-hidden relative snap-start flex-1 min-w-64 flex flex-col`}
      onClick={doTrackClick}
    >
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
        <h2 className="text-lg font-semibold mb-2">
          <a target="_blank" href={`https://elgiganten.se${url}`}>
            {title}
          </a>
        </h2>
        {hasRating && (
          <Stars
            rating={Number(values["6"]) / 10}
            numberOfRatings={Number(values["7"])}
          />
        )}

        <div className="flex items-center gap-2 mt-2">
          <StockIndicator stock={stock} stockLevel={stockLevel} />
        </div>

        <ul className="text-sm">
          {bp
            ?.split("\n")
            .filter((d) => d?.length)
            .map((bp) => (
              <li key={bp} className="line-clamp-1 overflow-ellipsis">
                {bp}
              </li>
            ))}
        </ul>

        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">
            <Price values={values} disclaimer={disclaimer} />
          </span>
        </div>
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

      <PopularityOverride id={id} />
      <UpdatedBanner lastUpdate={updated} />
    </div>
  );
};
