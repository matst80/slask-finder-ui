import { useState, useMemo } from "react";
import clsx from "clsx";
import { KeyFacet } from "./slask-finder/slask-finder.types";
import { isSelectedValue, useFacetSelectors } from "./facet-context";

const toSorted = (values: Record<string, number>) =>
  Object.entries(values)
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, count }));

export const KeyFacetSelector = ({
  name,
  result: { values },
  id,
  defaultOpen,
}: KeyFacet & { defaultOpen: boolean }) => {
  const { addFilter, removeFilter, selected } = useFacetSelectors(id);
  //const { keyFilters, addKeyFilter, removeKeyFilter } = useFilters();
  const [filter, setFilter] = useState("");
  const allSorted = useMemo(() => toSorted(values), [values]);
  const filtered = useMemo(() => {
    return filter.length > 2
      ? allSorted.filter(({ value }) =>
          value.toLowerCase().includes(filter.toLowerCase()),
        )
      : allSorted;
  }, [allSorted, filter]);
  //const [open, setOpen] = useState(defaultOpen && allSorted.length < 10);
  const [expanded, setExpanded] = useState(false);

  const toShow = expanded ? filtered : filtered.slice(0, 15);

  return (
    <div className="border-b border-gray-100 py-2">
      <span className="font-medium bold mb-2 flex items-center justify-between w-full text-left">
        {name}{" "}
        <span className="text-gray-500 text-sm">({allSorted.length})</span>
      </span>

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
        <div className="flex gap-2 flex-wrap">
          {toShow.map(({ value, count }) => {
            const checked = isSelectedValue(selected, value);
            return (
              <button
                key={value}
                className={clsx(
                  "flex items-center line-clamp-1 overflow-ellipsis py-1 text-sm border border-black rounded-2xl px-4 gap-2",
                  checked ? "bg-black" : "bg-white",
                )}
                onClick={() => {
                  if (!checked) {
                    addFilter(value);
                  } else {
                    removeFilter(value);
                  }
                }}
              >
                <span className={clsx(checked ? "text-white" : "text-black")}>
                  {value}
                </span>

                <em className="text-xs text-gray-400">({count})</em>
              </button>
            );
          })}
        </div>
        {allSorted.length > 14 && (
          <button
            className="underline text-sm"
            onClick={() => setExpanded((p) => !p)}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    </div>
  );
};
