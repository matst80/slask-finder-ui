import { InfoIcon } from "lucide-react";
import { ItemValues } from "../lib/types";
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
  disclaimer?: string;
};

export const PriceValue = ({
  value,
  className,
}: {
  value?: number;
  className?: string;
}) =>
  value == null ? null : (
    <span className={className}>{SEK.format(value / 100)}</span>
  );

export const Price = ({ values, disclaimer }: ValueProps) => {
  const prc = getPrice(values);
  if (prc.isDiscounted) {
    return (
      <div className="flex gap-1 items-end">
        <PriceValue value={prc.current} className="bold" />
        <PriceValue value={prc.original} className="opacity-50 text-sm" />
        <span className="text-sm bg-yellow-400 py-1 px-2">
          -{Math.round((prc.discount / prc.original) * 100)}%
        </span>
        {disclaimer != null && (
          <button className="relative group">
            <InfoIcon size={20} />
            <span className="hidden group-hover:block absolute p-3 right-5 bottom-0 bg-white border border-gray-950 text-xs">
              {disclaimer}
            </span>
          </button>
        )}
      </div>
    );
  }
  return <PriceValue value={prc.current} className="bold" />;
};
