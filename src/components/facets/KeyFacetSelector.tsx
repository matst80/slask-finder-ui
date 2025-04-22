import { ChevronUp, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { KeyFacet } from "../../lib/types";
import { useQueryKeyFacet } from "../../lib/hooks/useQueryKeyFacet";

const toSorted = (values: Record<string, number>, selected: Set<string>) =>
  Object.entries(values)
    .sort(
      (a, b) =>
        (selected.has(b[0]) ? 1 : 0) - (selected.has(a[0]) ? 1 : 0) ||
        b[1] - a[1]
    )
    .map(([value, count]) => ({ value, count }));

export const KeyFacetSelector = ({
  name,
  id,
  result,
  disabled,
  defaultOpen,
}: KeyFacet & { defaultOpen: boolean; disabled?: boolean }) => {
  const { values } = result;
  const { filter: filterValue, addValue, removeValue } = useQueryKeyFacet(id);
  const [filter, setFilter] = useState("");
  const allSorted = useMemo(
    () => toSorted(values, filterValue),
    [values, filterValue]
  );
  const filtered = useMemo(() => {
    return filter.length > 2
      ? allSorted.filter(
          ({ value }) =>
            value.toLowerCase().includes(filter.toLowerCase()) ||
            filterValue.has(value)
        )
      : allSorted;
  }, [allSorted, filter, filterValue]);
  const [open, setOpen] = useState(defaultOpen);
  const [expanded, setExpanded] = useState(false);

  const toShow = expanded ? filtered : filtered.slice(0, 10);

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
        <fieldset className="space-y-2" disabled={disabled}>
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
                  checked={filterValue.has(value)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      addValue(value);
                    } else {
                      removeValue(value);
                    }
                  }}
                />
                <span className="ml-2 text-gray-700">{value}</span>
              </div>
              <em className="text-xs text-gray-600">({count})</em>
            </label>
          ))}

          {allSorted.length > 9 && (
            <button
              className="underline text-sm"
              onClick={() => setExpanded((p) => !p)}
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </fieldset>
      )}
    </div>
  );
};
