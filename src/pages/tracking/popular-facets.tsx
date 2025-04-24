import useSWR from "swr";
import { getTrackingFieldPopularity } from "../../lib/datalayer/api";
import { useFacetMap } from "../../hooks/searchHooks";
import { useMemo } from "react";
import { isDefined } from "../../utils";

export const PopularFacetsView = () => {
  const { data } = useSWR("/api/facets", getTrackingFieldPopularity);
  const { data: facets } = useFacetMap();
  const popularFacets = useMemo(() => {
    if (!data || !facets) return [];
    return Object.entries(data)
      .map(([facetId, count]) => {
        const facet = facets?.[parseInt(facetId)];
        if (!facet) return null;
        return {
          ...facet,
          count,
        };
      })
      .filter(isDefined)
      .sort((a, b) => b.count - a.count);
  }, [data, facets]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Popular Facets
        </h1>
        <p className="text-gray-600">Most frequently used search filters</p>
      </div>

      <div className="grid gap-4">
        {popularFacets.map((facet, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-xs p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">
                {facet.name}
              </h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {facet.count.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
