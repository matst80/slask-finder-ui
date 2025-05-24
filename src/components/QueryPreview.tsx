import { useState, useMemo } from "react";
import { ChevronUp } from "lucide-react";
import { QueryProvider } from "../lib/hooks/QueryProvider";
import { TotalResultText } from "./ResultHeader";
import { ItemsQuery, RelationMatch } from "../lib/types";
import { QueryUpdater } from "./QueryMerger";
import { ResultCarousel } from "./itemdetails/ResultCarousel";

const hasValue = (
  relation: RelationMatch
): relation is Omit<RelationMatch, "value"> & { value: string | string[] } => {
  if (relation.value == null) return false;
  if (Array.isArray(relation.value)) {
    return relation.value.length > 0;
  }
  return true;
};

export const QueryPreview = ({ matches }: { matches: RelationMatch[] }) => {
  const [open, setOpen] = useState(false);
  const query = useMemo<ItemsQuery>(() => {
    return {
      string: matches
        .filter(hasValue)
        .map(({ facetId, exclude = false, value }) => ({
          id: facetId,
          exclude: exclude,
          value: Array.isArray(value) ? value : [value],
        })),
    };
  }, [matches]);

  return (
    <QueryProvider initialQuery={query}>
      <QueryUpdater query={query} />
      <div
        onClick={() => setOpen((p) => !p)}
        className="cursor-pointer border-b border-gray-200 pb-3 mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TotalResultText className="text-sm font-bold text-gray-700" />
            <span className="text-sm text-gray-500">matching items</span>
          </div>
          <ChevronUp
            className={`size-4 text-gray-500 transition-transform ${
              open ? "rotate-0" : "rotate-180"
            }`}
          />
        </div>
        {open && (
          <div className="mt-3">
            <ResultCarousel list_id="preview" list_name="Query preview" />
          </div>
        )}
      </div>
    </QueryProvider>
  );
};
