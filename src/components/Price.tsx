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
      <div
        className={cm(
          "flex justify-between font-bold relative group",
          sizes[size]
        )}
      >
        <div className="flex flex-col flex-1">
          <PriceValue value={prc.current} className="bold" />
          <PriceValue value={prc.original} className="opacity-50 text-sm" />
        </div>

        {disclaimer != null && (
          <span className="hidden group-hover:block absolute p-3 right-5 top-15 z-10 bg-white border border-gray-300 rounded-md text-xs">
            {disclaimer}
          </span>
        )}
      </div>
    );
  }
  return (
    <div className="font-bold">
      <PriceValue value={prc.current} className="bold" />
    </div>
  );
};
