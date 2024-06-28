import { useState } from "react";
import { useSearchContext } from "../SearchContext";
import { KeyFacet, NumberFacet } from "../types";

const toSorted = (values: Record<string, number>) =>
  Object.entries(values)
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, count }));

const KeyFacetSelector = ({ name, values, id }: KeyFacet) => {
  const { keyFilters, setKeyFilters, setPage } = useSearchContext();
  const [expanded, setExpanded] = useState(false);
  const allSorted = toSorted(values);
  const toShow = expanded ? allSorted : allSorted.slice(0, 10);

  return (
    <div>
      <h3>{name}</h3>
      <ul>
        {toShow.map(({ value, count }) => (
          <li key={value}>
            <label htmlFor={value}>
              <input
                type="checkbox"
                id={value}
                value={value}
                checked={keyFilters[id] === value}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setPage(0);
                  setKeyFilters((prev) => ({
                    ...prev,
                    [id]: checked ? value : undefined,
                  }));
                }}
              />
              <strong>{value}</strong> <em>({count})</em>
            </label>
          </li>
        ))}
        {allSorted.length > 10 ? (
          <button onClick={() => setExpanded((p) => !p)}>Toggle</button>
        ) : null}
      </ul>
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
    <div className="flex numbers">
      <input
        type="number"
        min={min}
        max={max}
        onChange={(e) => {
          const nr = Number(e.target.value);
          if (nr < max) setMinValue(nr);
        }}
        onBlur={() => onChange(minValue, maxValue)}
        value={minValue}
      />
      <input
        type="number"
        min={min}
        max={max}
        onChange={(e) => {
          const nr = Number(e.target.value);
          if (nr > min) setMaxValue(nr);
        }}
        onBlur={() => onChange(minValue, maxValue)}
        value={maxValue}
      />
    </div>
  );
};
const NumberFacetSelector = ({ name, min, max, count, id }: NumberFacet) => {
  const { setIntegerFilters, setPage } = useSearchContext();
  return (
    <div>
      <h3>{name}</h3>
      <Slider
        min={min}
        max={max}
        onChange={(min, max) => {
          setPage(0);
          setIntegerFilters((prev) => ({
            ...prev,
            [id]: { min, max },
          }));
        }}
      />
      <em>({count})</em>
    </div>
  );
};

export const Facets = () => {
  const { results } = useSearchContext();

  return results?.facets?.fields != null ? (
    <div className="sidebarMenuInner">
      {results.facets.fields?.map((facet) => (
        <KeyFacetSelector key={`keyfield-${facet.id}`} {...facet} />
      ))}
      {results.facets.integerFields?.map((facet) => (
        <NumberFacetSelector key={`intfield-${facet.id}`} {...facet} />
      ))}
    </div>
  ) : null;
};
