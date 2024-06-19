import { useSearchContext } from "../SearchContext";
import { ItemValues } from "../types";

const SEK = new Intl.NumberFormat("se-SV", {
  style: "currency",
  compactDisplay: "short",
  unitDisplay: "narrow",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  signDisplay: "auto",
  currency: "SEK",
});

const PriceValue = ({ value }: { value: number }) => (
  <span>{SEK.format(value / 100)}</span>
);

const Price = ({ values }: ValueProps) => {
  const prc = getPrice(values);
  if (prc.isDiscounted) {
    return (
      <div>
        <span style={{ textDecoration: "line-through" }}>
          <PriceValue value={prc.original} />
        </span>{" "}
        <PriceValue value={prc.current} />
        {/* <span> ({prc.discount})</span> */}
      </div>
    );
  }
  return <PriceValue value={prc.current} />;
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

export const SearchResultList = () => {
  const { results } = useSearchContext();

  return results != null ? (
    <div>
      <strong>Total hits: {results.totalHits}</strong>
      <ul className="hits">
        {results.items.map((item) => {
          //console.log(item);
          const { id, title, props, values } = item;

          return (
            <li key={`item-${id}`}>
              <strong>{title}</strong>
              <div>
                <em>{id}</em>
              </div>
              {props.img != null && (
                <img
                  src={
                    "https://www.elgiganten.se" +
                    props.img?.replace(".jpg", "--pdp_main-640.jpg")
                  }
                  alt={title}
                />
              )}
              <ul>
                {props.bp
                  ?.filter((d) => d?.length)
                  .map((bp) => (
                    <li key={bp}>{bp}</li>
                  ))}
              </ul>
              <Price values={values} />
            </li>
          );
        })}
      </ul>
    </div>
  ) : (
    <div>No results</div>
  );
};
