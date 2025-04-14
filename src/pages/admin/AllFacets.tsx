import { AdminFacet } from "./AdminFacets";
import { useMemo, useState } from "react";
import { useAdminFacets } from "../../adminHooks";
import fuzzysort from "fuzzysort";
import { byPriority } from "../../utils";

export const AllFacets = () => {
  const [filter, setFilter] = useState<string>("");
  const { data } = useAdminFacets();
  const filteredData = useMemo(() => {
    return fuzzysort.go(filter, data?.sort(byPriority) ?? [], {
      keys: ["name", "type"],
      all: filter.length == 0,
      limit: 50,
    });
    // return data
    //   ?.filter((field) => {
    //     if (!filter.length) return true;
    //     return (
    //       String(field.id).includes(filter) ||
    //       field.name.toLowerCase()?.includes(filter.toLowerCase())
    //     );
    //   })
    //   .slice(undefined, 100)
    //   .sort(byPriority);
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
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 grid grid-cols-5 gap-3">
        <div className="grid grid-cols-subgrid col-span-full border-b border-gray-300 p-4 font-bold">
          <div>Id</div>
          <div>Name</div>
          <div>Type</div>
          <div>Sort</div>
          <div>Priority</div>
        </div>
        {filteredData?.map(({ obj }) => (
          <AdminFacet key={obj.id} {...obj} />
        ))}
      </div>
    </div>
  );
};
