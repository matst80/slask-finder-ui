import { ChevronUp, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { useFilters } from "../../hooks/searchHooks";
import { NumberFacet, NumberResult } from "../../types";
import { converters } from "../../utils";
import { Slider } from "./Slider";

const NumberFacetSelector = ({
  name,
  result: { min, max },
  type,
  updateFilerValue,
  defaultOpen,
}: NumberFacet & {
  updateFilerValue: (min: number, max: number) => void;
  defaultOpen: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  const { toDisplayValue, fromDisplayValue } = useMemo(
    () => converters(type),
    [type],
  );

  return (
    <div className="mb-4 border-b border-gray-100 pb-2">
      <button
        className="font-medium bold mb-2 flex items-center justify-between w-full text-left"
        onClick={() => setOpen((p) => !p)}
      >
        {name}
        {open ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
      </button>

      {open && (
        <div className="flex gap-2">
          <Slider
            min={toDisplayValue(min)}
            max={toDisplayValue(max)}
            onChange={(min, max) => {
              updateFilerValue(fromDisplayValue(min), fromDisplayValue(max));
            }}
          />
        </div>
      )}
    </div>
  );
};

export const FloatFacetSelector = (facet: NumberFacet) => {
  const { addNumberFilter } = useFilters();

  return (
    <NumberFacetSelector
      {...facet}
      defaultOpen={false}
      updateFilerValue={(min, max) => {
        addNumberFilter(facet.id, min, max);
      }}
    />
  );
};

export const IntegerFacetSelector = (facet: NumberFacet) => {
  const { addIntegerFilter } = useFilters();

  return (
    <NumberFacetSelector
      {...facet}
      defaultOpen={false}
      updateFilerValue={(min, max) => {
        addIntegerFilter(facet.id, min, max);
      }}
    />
  );
};
