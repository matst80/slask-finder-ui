import { InfoIcon } from "lucide-react";
import { ItemValues } from "../lib/types";
import { cm, getPrice } from "../utils";

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

const sizes = { large: "text-2xl", medium: "text-xl", small: "text-lg" };

export const Price = ({
  values,
  disclaimer,
  size = "large",
}: ValueProps & { size?: keyof typeof sizes }) => {
  const prc = getPrice(values);
  if (prc.isDiscounted) {
    return (
      <div className={cm("flex justify-between font-bold", sizes[size])}>
        <div className="flex flex-col flex-1">
          <PriceValue value={prc.current} className="bold" />
          <PriceValue value={prc.original} className="opacity-50 text-sm" />
        </div>
        <span className="text-sm bg-yellow-400 flex items-center px-2 relative group">
          <span>-{Math.round((prc.discount / prc.original) * 100)}% </span>
          {disclaimer != null && (
            <span className="hidden group-hover:block absolute p-3 right-5 bottom-0 bg-white border border-gray-950 text-xs">
              {disclaimer}
            </span>
          )}
        </span>
      </div>
    );
  }
  return <PriceValue value={prc.current} className="bold" />;
};
