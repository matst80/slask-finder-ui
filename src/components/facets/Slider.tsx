import { useCallback, useEffect, useRef } from "react";
import { cm } from "../../utils";
import ReactRangeSliderInput from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

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
      <div className="flex gap-2">
        <input
          type="number"
          ref={minRef}
          className={cm(
            "text-xs text-gray-600 text-left px-2 bg-gray-100 rounded-lg"
          )}
          min={0}
          onBlur={updateValues}
          max={absoluteMax}
        />
        <span className="flex-1 text-center">-</span>
        <input
          type="number"
          ref={maxRef}
          className={cm(
            "text-xs text-gray-600 text-right px-2 bg-gray-100 rounded-lg"
          )}
          min={0}
          onBlur={updateValues}
          max={absoluteMax + 1}
        />
      </div>
      <div className="flex items-center gap-2 my-4">
        <ReactRangeSliderInput
          min={absoluteMin}
          max={absoluteMax}
          onInput={([minValue, maxValue]) => {
            const [newMin, newMax] = orderMinMax(
              clamp(minValue, absoluteMin, absoluteMax),
              clamp(maxValue, absoluteMin, absoluteMax)
            );
            console.log("onInput", newMin, newMax);
            if (minRef.current && maxRef.current) {
              minRef.current.value = newMin.toString();
              maxRef.current.value = newMax.toString();
              // onChange(newMin, newMax);
            }
          }}
          onRangeDragEnd={updateValues}
          onThumbDragEnd={updateValues}
          defaultValue={[min, max]}
        />
      </div>
    </>
  );
};
