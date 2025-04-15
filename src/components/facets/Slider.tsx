import { useEffect, useMemo, useState } from "react";
import { cm } from "../../utils";

type SliderProps = {
  min: number;
  max: number;
  absoluteMax: number;
  absoluteMin: number;
  onChange: (min: number, max: number) => void;
};

const clamp = (value: number, min: number, max: number): number => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

const orderMinMax = (a: number, b: number) => {
  if (a > b) {
    return [b, a];
  }
  return [a, b];
};

export const Slider = ({
  min,
  max,
  onChange,
  absoluteMax,
  absoluteMin,
}: SliderProps) => {
  const [a, setA] = useState(min);
  const [b, setB] = useState(max);

  const validMin = clamp(a, absoluteMin, absoluteMax);
  const validMax = clamp(b, absoluteMin, absoluteMax);

  useEffect(() => {
    setA(min);
    setB(max);
  }, [min, max]);

  useEffect(() => {
    const [minValue, maxValue] = orderMinMax(a, b);

    onChange(minValue, maxValue);
  }, [a, b, onChange]);
  const [minValue, maxValue] = useMemo(() => orderMinMax(a, b), [a, b]);
  return (
    <>
      <input
        type="number"
        className={cm(
          "text-sm text-gray-600 text-left px-2 bg-gray-200 rounded-lg flex-1",
          validMin ? "" : "border border-red-500"
        )}
        min={0}
        max={absoluteMax}
        onBlur={(e) => {
          const nr = Number(e.target.value);
          if (!isNaN(nr)) setA(clamp(nr, absoluteMin, absoluteMax));
        }}
        defaultValue={minValue}
      />
      <span>-</span>
      <input
        type="number"
        className={cm(
          "text-sm text-gray-600 text-right px-2 bg-gray-200 rounded-lg flex-1",
          validMax ? "" : "border border-red-500"
        )}
        min={0}
        max={absoluteMax}
        onBlur={(e) => {
          const nr = Number(e.target.value);
          if (!isNaN(nr)) setB(clamp(nr, absoluteMin, absoluteMax));
        }}
        defaultValue={maxValue}
      />
    </>
  );
};
