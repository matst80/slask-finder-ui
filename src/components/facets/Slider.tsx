import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);

  const updateValues = useCallback(() => {
    if (minRef.current && maxRef.current) {
      const minValue = parseInt(minRef.current.value);
      const maxValue = parseInt(maxRef.current.value);

      const [newMin, newMax] = orderMinMax(
        clamp(minValue, absoluteMin, absoluteMax),
        clamp(maxValue, absoluteMin, absoluteMax)
      );

      minRef.current.value = newMin.toString();
      maxRef.current.value = newMax.toString();

      onChange(newMin, newMax);
    }
  }, [minRef, maxRef, onChange, absoluteMin, absoluteMax]);

  useEffect(() => {
    if (minRef.current && maxRef.current) {
      minRef.current.value = min.toString();
      maxRef.current.value = max.toString();
    }
  }, [min, max, minRef, maxRef]);

  return (
    <>
      <input
        type="number"
        ref={minRef}
        className={cm(
          "text-sm text-gray-600 text-left px-2 bg-gray-200 rounded-lg flex-1"
        )}
        min={0}
        onBlur={updateValues}
        max={absoluteMax}
      />
      <span>-</span>
      <input
        type="number"
        ref={maxRef}
        className={cm(
          "text-sm text-gray-600 text-right px-2 bg-gray-200 rounded-lg flex-1"
        )}
        min={0}
        onBlur={updateValues}
        max={absoluteMax + 1}
      />
    </>
  );
};
