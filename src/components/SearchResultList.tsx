import { MapPin, ShoppingCart, Star } from "lucide-react";
import { getRawData, trackClick } from "../api";
import { useSearchContext } from "../SearchContext";
import { Item, ItemValues } from "../types";
import { useMemo } from "react";
import { stores } from "../stores";

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
        {/* <span> ({prc.discount})</span> */}
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

const ResultItem = ({
  id,
  title,
  img,
  badgeUrl,
  values,
  stock,
  bp,
  position,
  advertisingText,
}: Item & { position: number }) => {
  const doTrackClick = () => {
    trackClick(id, position);
    getRawData(id).then((data) => {
      console.log(data);
    });
  };
  const { locationId } = useSearchContext();
  const hasRating = values["6"] != null && values["7"] != null;
  const stockOnLocation = stock?.find((d) => d.id === locationId);
  return (
    <div
      key={`item-${id}`}
      className="bg-white rounded-sm shadow overflow-hidden"
      onClick={doTrackClick}
    >
      <div className="relative mt-2">
        {img != null && (
          <img
            className="w-full h-48 object-contain"
            src={
              "https://www.elgiganten.se" +
              img?.replace(".jpg", "--pdp_main-640.jpg")
            }
            alt={title}
          />
        )}
        {badgeUrl != null && (
          <img
            src={"https://www.elgiganten.se" + badgeUrl}
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
        {locationId != null && (
          <div className="flex items-center gap-2 mt-2">
            <MapPin />
            <span className="text-sm">{stockOnLocation?.level ?? "0"}</span>
          </div>
        )}
        <ul className="text-sm">
          {bp
            ?.split("\n")
            .filter((d) => d?.length)
            .map((bp) => <li key={bp}>{bp}</li>)}
        </ul>

        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">
            <Price values={values} />
          </span>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            <ShoppingCart />
          </button>
        </div>
        {advertisingText != null && (
          <em className="italic text-xs">{advertisingText}</em>
        )}
      </div>
    </div>
  );
};

export const SearchResultList = () => {
  const { results, page, pageSize } = useSearchContext();
  const start = page * pageSize;

  return results != null ? (
    <>
      {results.items?.map((item, idx) => (
        <ResultItem key={item.id} {...item} position={start + idx} />
      ))}
    </>
  ) : (
    <div>No results</div>
  );
};
