import { useFacetList } from "../../hooks/searchHooks";
import { AdminFacet } from "./AdminFacets";
import { byPriority } from "../../utils";

export const AllFacets = () => {
  const { data: facets } = useFacetList();
  return (
    <div className="container">
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 grid grid-cols-4 gap-3">
        <div className="grid grid-cols-subgrid col-span-full border-b border-gray-300 p-4 font-bold">
          <div>Name</div>
          <div>Type</div>
          <div>Sort</div>
          <div>Priority</div>
        </div>
        {facets?.sort(byPriority).map((facet) => (
          <AdminFacet key={facet.id} {...facet} />
        ))}
      </div>
    </div>
  );
};
