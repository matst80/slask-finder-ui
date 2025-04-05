import { useCallback } from "react";

import { FilteringQuery } from "../../types";
import { LoaderCircle } from "lucide-react";
import { stores } from "../../datalayer/stores";

import { FacetList } from "./facet-context";
import { useQuery } from "../../hooks/QueryProvider";

export const Facets = () => {
  const {
    facets,
    isLoadingFacets,
    setQuery,
    setStock,
    query: { stock },
  } = useQuery();

  //const allFacets = useMemo(() => (results ?? []).sort(byPriority), [results]);
  const hasFacets = facets.length > 0;
  const updateFilters = useCallback(
    (data: Pick<FilteringQuery, "range" | "string">) => {
      setQuery((prev) => ({
        ...prev,
        ...data,
      }));
    },
    [setQuery]
  );
  if (isLoadingFacets && !hasFacets) {
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
      <FacetList onFilterChanged={updateFilters}>
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
      </FacetList>
    )
  );
};
