import { ChevronUp, Star } from "lucide-react";
import { useState, useMemo } from "react";
import { KeyFacet } from "../../lib/types";
import { useQueryKeyFacet } from "../../lib/hooks/useQueryKeyFacet";
import { cm } from "../../utils";
import { useKeyFacetValuePopularity } from "../../hooks/popularityHooks";

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
  const { data: popularValues } = useKeyFacetValuePopularity(
    open ? id : undefined
  );
  const toShow = expanded ? filtered : filtered.slice(0, 10);

  return (
    <div
      className={cm(
        "mb-4 border-b border-gray-100 pb-2",
        disabled && "opacity-50"
      )}
    >
      <button
        className="font-medium bold mb-2 flex items-center justify-between w-full text-left"
        onClick={() => setOpen((p) => !p)}
      >
        <span>
          {name}{" "}
          <span className="text-gray-500 text-sm">({allSorted.length})</span>
        </span>

        <ChevronUp
          className={cm(
            "size-4 transition-transform",
            open ? "rotate-0" : "rotate-180"
          )}
        />
      </button>
      {open && (
        <fieldset className="space-y-2" disabled={disabled}>
          {allSorted.length > 25 && (
            <input
              type="text"
              className="w-full px-2 py-1 border border-gray-200 rounded-sm text-sm"
              placeholder={`Sök ${name}`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          )}
          {toShow.map(({ value, count }) => {
            const popularityIndex =
              popularValues?.findIndex((d) => d.value === value) ?? -1;
            return (
              <label
                key={value}
                className="flex items-center relative line-clamp-1 overflow-y-visible text-ellipsis justify-between p-1 text-sm rounded-md hover:bg-gray-100"
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
                <em className="text-xs text-gray-600">
                  {popularityIndex != -1 && popularityIndex < 4 && (
                    <Star
                      // fill="yellow"
                      className="size-4 text-xs inline-flex mr-2 text-amber-300 animate-pop"
                    />
                  )}
                  <span>({count})</span>
                </em>
              </label>
            );
          })}

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
