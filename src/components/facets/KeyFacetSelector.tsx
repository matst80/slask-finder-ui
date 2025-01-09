import { ChevronUp, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { KeyFacet } from "../../types";
import { isSelectedValue, useFacetSelectors } from "./Facets";

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
          value.toLowerCase().includes(filter.toLowerCase())
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
              className="flex items-center line-clamp-1 overflow-ellipsis justify-between p-1 text-sm"
            >
              <div>
                <input
                  type="checkbox"
                  id={value}
                  value={value}
                  checked={isSelectedValue(selected, value)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      addFilter(value);
                    } else {
                      removeFilter(value);
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
