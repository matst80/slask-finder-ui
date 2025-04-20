import clsx from "clsx";
import { useEffect, useState } from "react";

type SliderProps = {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
};

export const Slider = ({ min, max, onChange }: SliderProps) => {
  const [minValue, setMinValue] = useState(min);
  const [maxValue, setMaxValue] = useState(max);
  const validMin = min <= minValue && minValue <= max;
  const validMax = min <= maxValue && maxValue <= max;
  const valid = validMax && validMin;
  const isDirty = min !== minValue || max !== maxValue;
  useEffect(() => {
    setMinValue(min);
    setMaxValue(max);
  }, [min, max]);
  return (
    <>
      <input
        type="number"
        className={clsx(
          "text-sm text-gray-600 text-left px-4 py-1 border border-gray-400 rounded-2xl",
          validMin ? "" : "border border-red-500",
        )}
        min={0}
        max={max}
        onChange={(e) => {
          const nr = Number(e.target.value);
          if (!isNaN(nr)) setMinValue(nr);
        }}
        onBlur={() => onChange(minValue, maxValue)}
        value={minValue}
      />
      <span>-</span>
      <input
        type="number"
        className={clsx(
          "text-sm text-gray-600 text-right px-4 py-1 border border-gray-400 rounded-2xl",
          validMax ? "" : "border border-red-500",
        )}
        min={0}
        max={max}
        onChange={(e) => {
          const nr = Number(e.target.value);
          if (!isNaN(nr)) setMaxValue(nr);
        }}
        onBlur={() => {
          if (isDirty && valid) {
            onChange(minValue, maxValue);
          }
        }}
        value={maxValue}
      />
    </>
  );
};
