import { useFacetList } from "../../hooks/searchHooks";
import { AdminFacet } from "./AdminFacets";
import { byPriority } from "../../utils";
import { useMemo, useState } from "react";

export const AllFacets = () => {
  const [filter, setFilter] = useState<string>("");
  const { data } = useFacetList();
  const filteredData = useMemo(() => {
    return data
      ?.filter((field) => {
        if (!filter.length) return false;
        return field.name.toLowerCase()?.includes(filter.toLowerCase());
      })
      .sort(byPriority);
  }, [filter, data]);
  return (
    <div className="container">
      <div className="my-4">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-md p-2"
          placeholder="Search fields..."
        />
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 grid grid-cols-4 gap-3">
        <div className="grid grid-cols-subgrid col-span-full border-b border-gray-300 p-4 font-bold">
          <div>Name</div>
          <div>Type</div>
          <div>Sort</div>
          <div>Priority</div>
        </div>
        {filteredData?.sort(byPriority).map((facet) => (
          <AdminFacet key={facet.id} {...facet} />
        ))}
      </div>
    </div>
  );
};
