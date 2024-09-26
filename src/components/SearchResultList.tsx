import { getRawData, trackClick } from "../api";
import { useSearchContext } from "../SearchContext";
import { Item, ItemValues } from "../types";

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
      <div className="price discounted">
        <PriceValue value={prc.original} className="org" />

        <PriceValue value={prc.current} />
        {/* <span> ({prc.discount})</span> */}
      </div>
    );
  }
  return (
    <div className="price">
      <PriceValue value={prc.current} />
    </div>
  );
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

const ResultItem = ({
  id,
  title,
  img,
  badgeUrl,
  values,
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
  return (
    <li key={`item-${id}`} onClick={doTrackClick}>
      <strong>{title}</strong>
      <span>{values["6"] ?? ""}</span>
      <div>
        <em>{id}</em>
      </div>
      {img != null && (
        <img
          src={
            "https://www.elgiganten.se" +
            img?.replace(".jpg", "--pdp_main-640.jpg")
          }
          alt={title}
        />
      )}
      {badgeUrl != null && (
        <img
          className="badge"
          src={"https://www.elgiganten.se" + badgeUrl}
          alt={title}
        />
      )}
      <ul>
        {bp
          ?.split("\n")
          .filter((d) => d?.length)
          .map((bp) => (
            <li key={bp}>{bp}</li>
          ))}
      </ul>
      <Price values={values} />
      {advertisingText != null && <em>{advertisingText}</em>}
    </li>
  );
};

export const SearchResultList = () => {
  const { results, page, pageSize } = useSearchContext();
  const start = page * pageSize;
  return results != null ? (
    <ul className="hits" id="results">
      {results.items?.map((item, idx) => (
        <ResultItem key={item.id} {...item} position={start + idx} />
      ))}
    </ul>
  ) : (
    <div>No results</div>
  );
};
