import { ChevronUp, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { useFilters } from "../../hooks/searchHooks";
import { KeyFacet } from "../../types";

const toSorted = (values: Record<string, number>) =>
  Object.entries(values)
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, count }));

export const KeyFacetSelector = ({
  name,
  values,
  id,
  defaultOpen,
}: KeyFacet & { defaultOpen: boolean }) => {
  const { keyFilters, addKeyFilter, removeKeyFilter } = useFilters();
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
              className="flex items-center line-clamp-1 overflow-ellipsis justify-between p-1 text-sm rounded-md hover:bg-gray-100"
            >
              <div>
                <input
                  type="checkbox"
                  id={value}
                  value={value}
                  checked={keyFilters.some(
                    (d) => d.value === value && d.id === id
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
