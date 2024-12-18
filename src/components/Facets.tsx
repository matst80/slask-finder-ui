import { useMemo, useState } from "react";
import { isKeyFacet, isNumberFacet, KeyFacet, NumberFacet } from "../types";
import { ChevronDown, ChevronUp, LoaderCircle } from "lucide-react";
import { byPriority, cm, colourNameToHex, converters } from "../utils";
import {
  useFilters,
  useHashFacets,
  useQueryHelpers,
} from "../hooks/searchHooks";
import { stores } from "../datalayer/stores";

const toSorted = (values: Record<string, number>) =>
  Object.entries(values)
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, count }));

const KeyFacetSelector = ({
  name,
  id,
  result,
  defaultOpen,
}: KeyFacet & { defaultOpen: boolean }) => {
  const { values } = result;
  const { keyFilters, addKeyFilter, removeKeyFilter } = useFilters();
  const [filter, setFilter] = useState("");
  const allSorted = useMemo(() => toSorted(values), [values]);
  const filtered = useMemo(() => {
    return filter.length > 2
      ? allSorted.filter(({ value }) =>
          value.toLowerCase().includes(filter.toLowerCase()),
        )
      : allSorted;
  }, [allSorted, filter]);
  const [open, setOpen] = useState(defaultOpen && allSorted.length < 10);
  const [expanded, setExpanded] = useState(false);

  const toShow = expanded ? filtered : filtered.slice(0, 15);

  return (
    <div className="mb-4 border-b border-gray-100 pb-2">
      <button
        className="font-medium bold mb-2 flex items-center justify-between w-full text-left"
        onClick={() => setOpen((p) => !p)}
      >
        <span>
          {name}{" "}
          <span className="text-gray-500 text-sm">({allSorted.length})</span>
        </span>
        {open ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
      </button>
      {open && (
        <div className="space-y-2">
          {allSorted.length > 25 && (
            <input
              type="text"
              className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
              placeholder={`Sök ${name}`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          )}
          {toShow.map(({ value, count }) => (
            <label
              key={value}
              className="flex items-center line-clamp-1 overflow-ellipsis justify-between p-1 text-sm rounded-md hover:bg-gray-100"
            >
              <div>
                <input
                  type="checkbox"
                  id={value}
                  value={value}
                  checked={keyFilters.some(
                    (d) => d.value === value && d.id === id,
                  )}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      addKeyFilter(id, value);
                    } else {
                      removeKeyFilter(id);
                    }
                  }}
                />
                <span className="ml-2 text-gray-700">{value}</span>
              </div>
              <em className="text-xs text-gray-600">({count})</em>
            </label>
          ))}

          {allSorted.length > 14 && (
            <button
              className="underline text-sm"
              onClick={() => setExpanded((p) => !p)}
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

type SliderProps = {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
};

const Slider = ({ min, max, onChange }: SliderProps) => {
  const [minValue, setMinValue] = useState(min);
  const [maxValue, setMaxValue] = useState(max);
  const validMin = min <= minValue && minValue <= max;
  const validMax = min <= maxValue && maxValue <= max;
  const valid = validMax && validMin;
  const isDirty = min !== minValue || max !== maxValue;
  return (
    <>
      <input
        type="number"
        className={cm(
          "text-sm text-gray-600 text-left px-2 bg-gray-200 rounded-lg flex-1",
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
        className={cm(
          "text-sm text-gray-600 text-right px-2 bg-gray-200 rounded-lg flex-1",
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

const FloatFacetSelector = (facet: NumberFacet) => {
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

const IntegerFacetSelector = (facet: NumberFacet) => {
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

const ColorFacetSelector = ({ id, result: { values } }: KeyFacet) => {
  const { addKeyFilter, keyFilters, removeKeyFilter } = useFilters();

  return (
    <div className="mb-4 border-b border-gray-100 pb-2">
      <h3 className="font-medium mb-2">Färg</h3>
      <div className="flex flex-wrap gap-2">
        {Object.keys(values).map((color) => {
          const colorHex = colourNameToHex(color);
          if (!colorHex) {
            return null;
          }
          const selected = keyFilters.find(
            (f) => f.id === id && f.value === color,
          );
          return (
            <button
              key={color}
              title={color}
              className={cm(
                `w-6 h-6 rounded-full border`,
                selected ? "border-blue-500" : "border-gray-300",
              )}
              style={colorHex}
              aria-label={`Filter by ${color}`}
              onClick={() => {
                selected != null
                  ? removeKeyFilter(id)
                  : addKeyFilter(id, color);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export const Facets = () => {
  const { data: results, isLoading } = useHashFacets();
  const {
    query: { stock },
    setStock,
  } = useQueryHelpers();

  const allFacets = useMemo(
    () => results ?? [].sort(byPriority),
    [results],
  );
  const hasFacets = allFacets.length > 0;
  if (isLoading && !hasFacets) {
    return (
      <aside className="w-full md:w-72 animate-pulse">
        <h2 className="text-lg font-semibold mb-4">Filter</h2>
        <div className="my-10 flex items-center justify-center">
          <LoaderCircle className="size-10 animate-spin" />
        </div>
      </aside>
    );
  }

  return (
    hasFacets && (
      <aside className="w-full md:w-72">
        <h2 className="text-lg font-semibold mb-4">Filter</h2>
        <div>
          {allFacets.map((facet, i) => {
            if (isKeyFacet(facet) && facet.type === "color") {
              return (
                <ColorFacetSelector
                  {...facet}
                  key={`fld-${facet.id}-${facet.name}`}
                />
              );
            }
            if (isNumberFacet(facet)) {
              return (
                <FloatFacetSelector
                  {...facet}
                  key={`fld-${facet.id}-${facet.name}`}
                />
              );
            }
            if (isNumberFacet(facet)) {
              return (
                <IntegerFacetSelector
                  {...facet}
                  key={`fld-${facet.id}-${facet.name}`}
                />
              );
            }

            return (
              <KeyFacetSelector
                {...facet}
                key={`fld-${facet.id}-${facet.name}`}
                defaultOpen={i < 5}
              />
            );
          })}
        </div>

        <div className="mb-4">
          <h3 className="font-medium mb-2">Select Store</h3>
          <select
            value={stock?.[0] ?? ""}
            onChange={(e) =>
              setStock(e.target.value === "" ? [] : [e.target.value])
            }
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Ingen butik</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.displayName.replace("Elgiganten ", "")}
              </option>
            ))}
          </select>
        </div>
      </aside>
    )
  );
};
