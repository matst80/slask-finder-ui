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

const sizes = {
  large: "text-3xl",
  medium: "text-2xl",
  small: "text-xl",
};

export const Price = ({
  values,
  disclaimer,
  size = "large",
}: ValueProps & { size?: keyof typeof sizes }) => {
  const prc = getPrice(values);
  if (prc.isDiscounted) {
    return (
      <div className="group">
        <div className={cm("flex flex-col gap-1")}>
          <PriceValue
            value={prc.current}
            className={cm("text-red-600 font-bold", sizes[size])}
          />

          {disclaimer != null && (
            <div className="relative">
              <div className="hidden group-hover:block absolute left-0 top-1 z-10">
                <div className="bg-white p-3 rounded-md shadow-lg border border-gray-200 max-w-xs">
                  <div className="absolute -top-1 left-4 w-3 h-3 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                  <p className="text-xs font-normal text-gray-700">
                    {disclaimer}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className={cm("font-bold", sizes[size])}>
      <PriceValue value={prc.current} className="text-primary-600" />
    </div>
  );
};
