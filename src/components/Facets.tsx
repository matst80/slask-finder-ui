import { useState } from "react";
import { useFilters, useSearchContext } from "../SearchContext";
import { KeyFacet, NumberFacet } from "../types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { stores } from "../stores";

const toSorted = (values: Record<string, number>) =>
  Object.entries(values)
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, count }));

const KeyFacetSelector = ({ name, values, id }: KeyFacet) => {
  const { keyFilters, addKeyFilter, removeKeyFilter } = useFilters();
  const [filter, setFilter] = useState("");
  const allSorted = toSorted(values);
  const filtered =
    filter.length > 2
      ? allSorted.filter(({ value }) =>
          value.toLowerCase().includes(filter.toLowerCase()),
        )
      : allSorted;
  const [open, setOpen] = useState(allSorted.length < 10);
  const [expanded, setExpanded] = useState(false);

  const toShow = expanded ? filtered : filtered.slice(0, 15);

  return (
    <div className="mb-4 border-b border-gray-100 pb-2">
      <button
        className="font-medium bold mb-2 flex items-center justify-between w-full text-left"
        onClick={() => setOpen((p) => !p)}
      >
        {name} ({allSorted.length}){" "}
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
              className="flex items-center line-clamp-1 overflow-ellipsis justify-between text-sm"
            >
              <div>
                <input
                  type="checkbox"
                  id={value}
                  value={value}
                  checked={keyFilters[id] === value}
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
  return (
    <>
      <input
        type="number"
        className="text-sm text-gray-600 text-left px-2 bg-gray-200 rounded-lg flex-1"
        min={min}
        max={max}
        onChange={(e) => {
          const nr = Number(e.target.value);
          if (nr < max) setMinValue(nr);
        }}
        onBlur={() => onChange(minValue, maxValue)}
        value={minValue}
      />
      <span>-</span>
      <input
        type="number"
        className="text-sm text-gray-600 text-right px-2 bg-gray-200 rounded-lg flex-1"
        min={min}
        max={max}
        onChange={(e) => {
          const nr = Number(e.target.value);
          if (nr > min) setMaxValue(nr);
        }}
        onBlur={() => onChange(minValue, maxValue)}
        value={maxValue}
      />
    </>
  );
};
const NumberFacetSelector = ({ name, min, max, id }: NumberFacet) => {
  const { addIntegerFilter } = useFilters();

  return (
    <div className="mb-4 border-b border-gray-100 pb-2">
      <h3 className="font-medium mb-2">{name}</h3>

      <div className="flex gap-2">
        <Slider
          min={min}
          max={max}
          onChange={(min, max) => {
            addIntegerFilter(id, min, max);
          }}
        />
      </div>
    </div>
  );
};

const FloatFacetSelector = ({ name, min, max, id }: NumberFacet) => {
  const { addNumberFilter } = useFilters();

  return (
    <div className="mb-4">
      <h3 className="font-medium mb-2">{name}</h3>

      <div className="flex gap-2">
        <Slider
          min={min}
          max={max}
          onChange={(min, max) => {
            addNumberFilter(id, min, max);
          }}
        />
      </div>
    </div>
  );
};

export const Facets = () => {
  const { results, setLocationId, locationId } = useSearchContext();

  // <div>
  //   <h3 className="font-medium mb-2">Color</h3>
  //   <div className="flex flex-wrap gap-2">
  //     {['red', 'blue', 'green', 'yellow', 'black', 'white'].map((color) => (
  //       <button
  //         key={color}
  //         className={`w-6 h-6 rounded-full border border-gray-300`}
  //         style={{ backgroundColor: color }}
  //         aria-label={`Filter by ${color}`}
  //         onClick={() => addFilter(color)}
  //       />
  //     ))}
  //   </div>
  // </div>

  return results?.facets?.fields != null ? (
    <>
      {results.facets.fields?.map((facet) => (
        <KeyFacetSelector key={`keyfield-${facet.id}`} {...facet} />
      ))}
      {results.facets.integerFields?.map((facet) => (
        <NumberFacetSelector key={`intfield-${facet.id}`} {...facet} />
      ))}
      {results.facets.numberFields?.map((facet) => (
        <FloatFacetSelector key={`floatfield-${facet.id}`} {...facet} />
      ))}
      <div className="mb-4">
        <h3 className="font-medium mb-2">Select Store</h3>
        <select
          value={locationId}
          onChange={(e) =>
            setLocationId(e.target.value === "" ? undefined : e.target.value)
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
    </>
  ) : null;
};
