import useSWR from "swr";
import { getTrackingFieldPopularity } from "../../datalayer/api";
import { useFacetList } from "../../hooks/searchHooks";
import { useMemo } from "react";
import { isDefined } from "../../utils";

export const PopularFacetsView = () => {
  const { data } = useSWR("/api/facets", getTrackingFieldPopularity);
  const { data: facets } = useFacetList();
  const popularFacets = useMemo(() => {
    if (!data || !facets) return [];
    return Object.entries(data)
      .map(([facetId, count]) => {
        const facet = facets.find((f) => f.id === parseInt(facetId));
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
    <div>
      <h1 className="font-bold text-xl">Popular Facets</h1>
      <div>
        <h2>Popular Facets</h2>
        {popularFacets.map((facet, i) => (
          <div key={i}>
            <h2>
              {facet.name} ({facet.count})
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
};
