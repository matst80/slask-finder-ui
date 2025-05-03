import { ItemValues } from "../lib/types";
import { cm, getLocale, getPrice } from "../utils";

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
}) => {
  return value == null ? null : (
    <span className={className}>
      {new Intl.NumberFormat(getLocale(), {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        currencySign: "standard",
        currencyDisplay: "symbol",
        currency: "SEK",
      }).format(value / 100)}
    </span>
  );
};

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
      <div className={cm("flex flex-col gap-1")}>
        <div className="relative peer">
          <PriceValue
            value={prc.current}
            className={cm("text-red-600 font-bold", sizes[size])}
          />
          <div className="absolute text-xs -top-2 shadow-md left-4 px-1 py-0.5 bg-white/80 font-normal duration-500 transition-all rounded-md rotate-2 hover:scale-125 hover:rotate-0 hover:bg-white/80">
            <span>Spara </span>
            <PriceValue value={prc.original - prc.current} />
          </div>
        </div>
        {disclaimer != null && (
          <div className="hidden peer-hover:block absolute z-10 mt-11">
            <div className="bg-white transition-opacity opacity-0 group-hover:opacity-100 p-3 rounded-md shadow-lg border border-gray-200 max-w-xs">
              <div className="absolute -top-1 left-4 w-3 h-3 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
              <p className="text-xs font-normal text-gray-700">{disclaimer}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={cm("font-bold", sizes[size])}>
      <PriceValue value={prc.current} className="text-primary-600" />
    </div>
  );
};
