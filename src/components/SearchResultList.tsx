import { Save, ShoppingCart, Star, Zap } from "lucide-react";
import { getRawData, trackClick, updatePopularity } from "../api";
import { usePopularityContext, useSearchContext } from "../SearchContext";
import { Item, ItemValues } from "../types";
import { useCallback, useEffect, useMemo, useState } from "react";

const SEK = new Intl.NumberFormat("se-SV", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,

  currency: "SEK",
});

const PriceValue = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => <span className={className}>{SEK.format(value / 100)}</span>;

const Price = ({ values }: ValueProps) => {
  const prc = getPrice(values);
  if (prc.isDiscounted) {
    return (
      <div className="flex gap-1 items-end">
        <PriceValue value={prc.current} className="bold" />
        <PriceValue value={prc.original} className="opacity-50 text-sm" />
        <span className="text-sm bg-yellow-400 py-1 px-2">
          -{Math.round((prc.discount / prc.original) * 100)}%
        </span>
      </div>
    );
  }
  return <PriceValue value={prc.current} className="bold" />;
};

type Price =
  | {
      isDiscounted: false;
      current: number;
    }
  | {
      isDiscounted: true;
      current: number;
      original: number;
      discount: number;
    };

type ValueProps = {
  values: ItemValues;
};

const getPrice = (values: ItemValues): Price => {
  const current = Number(values["4"]);
  const original = values["5"] != null ? Number(values["5"]) : null;
  const discount = values["8"] != null ? Number(values["8"]) : null;

  if (original != null && original > current) {
    return {
      isDiscounted: true,
      current,
      original,
      discount: discount ?? original - current,
    };
  }
  return {
    isDiscounted: false,
    current: Number(current ?? 0),
  };
};

const Stars = ({
  rating,
  numberOfRatings,
}: {
  rating: number;
  numberOfRatings: number;
}) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-gray-600">
        {rating.toFixed(1)} ({numberOfRatings})
      </span>
    </div>
  );
};

const useItemPopularity = (id: string) => {
  const { popularity, setPopularity } = usePopularityContext();
  const [dirty, setDirty] = useState(false);
  const value = useMemo(() => popularity[id], [id, popularity]);
  const setValue = useCallback(
    (value: number) => {
      const updated = { ...popularity, [id]: value };
      setPopularity(updated);
      setDirty(true);
    },
    [id, popularity, setPopularity]
  );
  const commit = useCallback(() => {
    updatePopularity(popularity).then(() => {
      setDirty(false);
    });
  }, [popularity]);
  return { value, setValue, commit, dirty };
};

const PopularityOverride = ({ id }: { id: string }) => {
  const { value, setValue, dirty, commit } = useItemPopularity(id);
  return (
    <div className="absolute top-2 left-0 bg-gray-200 p-1 rounded-br-md rounded-tr-md flex items-center">
      <Star size={18} />
      <span className="text-xs text-gray-600">
        <input
          type="number"
          value={value ?? 0}
          className="w-16 bg-gray-200 text-center border-none focus:ring-0"
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </span>
      {dirty && (
        <button onClick={commit}>
          <Save size={18} />
        </button>
      )}
    </div>
  );
};

const makeImageUrl = (pathOrUrl: string, size = "--pdp_main-640.jpg") => {
  if (pathOrUrl.startsWith("http")) {
    return pathOrUrl;
  }
  return "https://www.elgiganten.se" + pathOrUrl?.replace(".jpg", size);
};

const ResultItem = ({
  id,
  title,
  img,
  badgeUrl,
  values,
  stock,
  bp,
  lastUpdate: updated,
  position,
  stockLevel,
  advertisingText,
}: Item & {
  position: number;
}) => {
  const doTrackClick = () => {
    trackClick(id, position);
    getRawData(id).then((data) => {
      console.log(data);
    });
  };
  const { locationId } = useSearchContext();
  const hasRating = values["6"] != null && values["7"] != null;
  const stockOnLocation = stock?.find((d) => d.id === locationId);
  const storesWithStock = stock?.length ?? 0;
  const recentlyUpdated = useMemo(
    () => (updated ?? 0) > Date.now() - 1000 * 60 * 60,
    [updated]
  );

  return (
    <div
      key={`item-${id}`}
      className={`bg-white rounded-sm shadow overflow-hidden relative`}
      onClick={doTrackClick}
    >
      <div className="relative mt-2">
        <PopularityOverride id={id} />
        {img != null && (
          <img
            className="w-full h-48 object-contain"
            src={makeImageUrl(img)}
            alt={title}
          />
        )}
        {badgeUrl != null && (
          <img
            src={makeImageUrl(badgeUrl)}
            alt={title}
            className="size-16 object-contain absolute top-4 right-4"
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

        <div className="flex items-center gap-2 mt-2">
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
            <span
              className={`text-sm ${
                storesWithStock > 0 ? "text-green-500" : "text-yellow-500"
              }`}
            >
              Finns i {storesWithStock} butiker
            </span>
          )}{" "}
          |{" "}
          <span
            className={`text-sm ${
              stockLevel != null ? "text-green-500" : "text-yellow-500"
            }`}
          >
            {stockLevel != null ? `Online: ${stockLevel}` : "Inte i lager"}
          </span>
        </div>

        <ul className="text-sm">
          {bp
            ?.split("\n")
            .filter((d) => d?.length)
            .map((bp) => (
              <li key={bp}>{bp}</li>
            ))}
        </ul>

        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">
            <Price values={values} />
          </span>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            <ShoppingCart />
          </button>
        </div>
        {recentlyUpdated && (
          <div className="flex items-center p-1 bg-yellow-300 text-xs gap-2 absolute top-0 right-0">
            <Zap size={18} />
            <TimeAgo ts={updated} />
          </div>
        )}
        {advertisingText != null && (
          <em className="italic text-xs">{advertisingText}</em>
        )}
      </div>
    </div>
  );
};

const timeDiff = 7200000;

const TimeAgo = ({ ts }: { ts?: number }) => {
  const now = Date.now();
  const [diff, setDiff] = useState(now + timeDiff - (ts ?? 0));

  useEffect(() => {
    if (ts == null) {
      return;
    }
    const interval = setInterval(() => {
      setDiff(Date.now() + timeDiff - ts);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [ts]);
  if (ts == null) {
    return null;
  }
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (diff < 0) {
    return <span>Just nu</span>;
  }
  if (days > 0) {
    return <span>{days} dagar sedan</span>;
  }
  if (hours > 0) {
    return <span>{hours} timmar sedan</span>;
  }
  if (minutes > 0) {
    return <span>{minutes} minuter sedan</span>;
  }
  return <span>{seconds} sekunder sedan</span>;
};

export const SearchResultList = () => {
  const { results, page, pageSize, loadingItems } = useSearchContext();

  const start = page * pageSize;
  if (loadingItems && (!results || !results.items.length)) {
    return <div>Loading...</div>;
  }

  if (!results || !results.items.length) {
    return <div>No results</div>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {results?.items.map((item, idx) => (
        <ResultItem key={item.id} {...item} position={start + idx} />
      ))}
    </div>
  );
};
