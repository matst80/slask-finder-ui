import { useCallback, useEffect, useRef, useState } from "react";
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
  const [selected, setSelected] = useState<"min" | "max" | null>(null);

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

  const sliderChange =
    (side: "min" | "max") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      console.log(side, value);

      if (side === "min") {
        if (minRef.current) {
          minRef.current.value = (value * (absoluteMax - absoluteMin))
            .toFixed(0)
            .toString();
        }
      } else {
        if (maxRef.current) {
          maxRef.current.value = (value * (absoluteMax - absoluteMin))
            .toFixed(0)
            .toString();
        }
      }
    };

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
            "text-sm text-gray-600 text-left px-2 bg-gray-200 rounded-lg flex-1"
          )}
          min={0}
          onFocus={() => setSelected("min")}
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
          onFocus={() => setSelected("max")}
          onBlur={updateValues}
          max={absoluteMax + 1}
        />
      </div>
      {selected === "max" && (
        <input
          type="range"
          min={0}
          max={1}
          step={"any"}
          onInput={sliderChange("max")}
          onMouseUp={updateValues}
          onTouchEnd={updateValues}
          defaultValue={max / (absoluteMax - absoluteMin)}
          className="w-full mt-2"
        />
      )}
      {selected === "min" && (
        <input
          type="range"
          defaultValue={min / (absoluteMax - absoluteMin)}
          onInput={sliderChange("min")}
          onMouseUp={updateValues}
          onTouchEnd={updateValues}
          step={"any"}
          min={0}
          max={1}
          className="w-full mt-2"
        />
      )}
    </>
  );
};
