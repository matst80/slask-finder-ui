import { ItemValues } from "../types";
import { getPrice } from "../utils";

const SEK = new Intl.NumberFormat("se-SV", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  currencySign: "accounting",
  currencyDisplay: "symbol",
  currency: "SEK",
});

type ValueProps = {
  values: ItemValues;
};

const PriceValue = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => <span className={className}>{SEK.format(value / 100)}</span>;

export const Price = ({ values }: ValueProps) => {
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
