import { ChevronUp, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { NumberFacet } from "../../lib/types";
import { converters } from "../../utils";
import { Slider } from "./Slider";
import { useQueryRangeFacet } from "../../lib/hooks/QueryProvider";

export const NumberFacetSelector = ({
  id,
  name,
  result: { min, max, count, buckets },
  valueType,
  defaultOpen,
}: NumberFacet & {
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const { updateValue } = useQueryRangeFacet(id);
  const { toDisplayValue, fromDisplayValue } = useMemo(
    () => converters(valueType),
    [valueType]
  );

  return (
    <div className="mb-4 border-b border-gray-100 pb-2">
      <button
        className="font-medium bold mb-2 flex items-center justify-between w-full text-left"
        onClick={() => setOpen((p) => !p)}
      >
        <span>
          {name} <span className="text-gray-500 text-sm">({count})</span>
        </span>
        {open ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
      </button>

      {open && (
        <>
          <div className="flex gap-2">
            <Slider
              min={toDisplayValue(min)}
              max={toDisplayValue(max)}
              onChange={(min, max) => {
                updateValue({
                  min: fromDisplayValue(min),
                  max: fromDisplayValue(max),
                });
              }}
            />
          </div>
          {buckets != null && buckets.length > 1 && (
            <div className="relative mt-4 h-20 w-full border border-gray-300 rounded-md overflow-hidden">
              {buckets.map((size, i, all) => {
                return (
                  <div
                    style={{
                      height: `${size + 1}%`,
                      width: `${100 / all.length}%`,
                      left: `${(100 / all.length) * i}%`,
                    }}
                    className="bg-slate-600 bottom-0 absolute"
                  ></div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
