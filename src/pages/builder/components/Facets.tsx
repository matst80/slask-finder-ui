import { useMemo } from "react";
import { LoaderCircle } from "lucide-react";
import { FacetList } from "./facet-context";
import { useHashFacets } from "./slask-finder/searchHooks";

export const Facets = () => {
  const { data: results, isLoading } = useHashFacets();
  // const { setQuery } = useHashQuery();
  // const {
  //   query: { stock },
  //   setStock,
  // } = useQueryHelpers();

  const allFacets = useMemo(() => results ?? [], [results]);
  const hasFacets = allFacets.length > 0;
  // const updateFilters = useCallback(
  //   (data: Pick<FilteringQuery, "range" | "string">) => {
  //     setQuery((prev) => ({
  //       ...prev,
  //       ...data,
  //     }));
  //   },
  //   [setQuery],
  // );
  if (isLoading && !hasFacets) {
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
      <>
        <FacetList />
      </>
    )
  );
};
