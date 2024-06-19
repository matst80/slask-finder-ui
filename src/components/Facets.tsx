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

const NumberFacetSelector = ({ name, min, max, count, id }: NumberFacet) => {
  const { integerFilters, setIntegerFilters, setPage } = useSearchContext();
  return (
    <div>
      <h3>{name}</h3>
      <label>
        From:{" "}
        <input
          type="range"
          value={integerFilters[id]?.min ?? min}
          min={min}
          max={max}
          onChange={(e) => {
            const value = e.target.value;
            console.log(id, value);
            setPage(0);
            setIntegerFilters((prev) => ({
              ...prev,
              [id]: {
                min: value === "" ? min : Number(value),
                max: prev[id]?.max ?? max,
              },
            }));
          }}
        />
      </label>
      {/* <label>
        Max:{" "}
        <input
          type="number"
          value={integerFilters[id]?.max ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            setPage(0);
            setIntegerFilters((prev) => ({
              ...prev,
              [id]: {
                min: prev[id]?.min ?? min,
                max: value === "" ? max : Number(value),
              },
            }));
          }}
        />
      </label> */}
      <em>({count})</em>
    </div>
  );
};

export const Facets = () => {
  const { results } = useSearchContext();

  return results?.facets?.fields != null ? (
    <div>
      {results.facets.fields?.map((facet) => (
        <KeyFacetSelector key={`keyfield-${facet.id}`} {...facet} />
      ))}
      {results.facets.integerFields?.map((facet) => (
        <NumberFacetSelector key={`intfield-${facet.id}`} {...facet} />
      ))}
    </div>
  ) : null;
};
