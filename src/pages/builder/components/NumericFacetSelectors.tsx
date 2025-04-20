import { useMemo } from "react";
import { NumberFacet } from "./slask-finder/slask-finder.types";
import { Slider } from "./Slider";
import { useFacetSelectors } from "./facet-context";

const toDisplayValue = (type: string) => (value: number) => {
  if (type === "currency") {
    return value / 100;
  }
  return value;
};
const fromDisplayValue = (type: string) => (value: number) => {
  if (type === "currency") {
    return Math.round(value * 100);
  }
  return value;
};

export const converters = (type: string) => {
  return {
    toDisplayValue: toDisplayValue(type),
    fromDisplayValue: fromDisplayValue(type),
  };
};

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
  const { toDisplayValue, fromDisplayValue } = useMemo(
    () => converters(type),
    [type],
  );

  return (
    <div className="border-b border-gray-100 py-2">
      <div className="font-medium bold mb-2 flex items-center justify-between w-full text-left">
        {name}
      </div>

      <div className="flex gap-2">
        <Slider
          min={toDisplayValue(min)}
          max={toDisplayValue(max)}
          onChange={(min, max) => {
            updateFilerValue(fromDisplayValue(min), fromDisplayValue(max));
          }}
        />
      </div>
    </div>
  );
};

export const FloatFacetSelector = (facet: NumberFacet) => {
  const { addFilter } = useFacetSelectors(facet.id);

  return (
    <NumberFacetSelector
      {...facet}
      defaultOpen={false}
      updateFilerValue={(min, max) => {
        addFilter({ min, max });
      }}
    />
  );
};

export const IntegerFacetSelector = (facet: NumberFacet) => {
  const { addFilter } = useFacetSelectors(facet.id);

  return (
    <NumberFacetSelector
      {...facet}
      defaultOpen={false}
      updateFilerValue={(min, max) => {
        addFilter({ min, max });
      }}
    />
  );
};
