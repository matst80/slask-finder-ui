"use client";

import { useFacetMap } from "../../../hooks/searchHooks"
import { Item } from "../../../lib/types"

export const ImportantFacets = ({
  tableFacets,
  values,
}: {
  tableFacets: number[];
  values: Item["values"];
}) => {
  const { data } = useFacetMap();
  return (
    <div className="hidden md:flex flex-wrap gap-2 mt-4">
      {tableFacets.map((id) => {
        const value = values[id];
        if (value == null) return null;
        return (
          <div
            key={id}
            className="px-2 py-1 bg-gray-100 rounded-xl text-xs font-bold"
          >
            <span className="text-gray-500">
              {data?.[id]?.name}:&nbsp;
            </span>
            <span className="text-blue-700">
              {Array.isArray(value) ? value.join(", ") : value}
            </span>
          </div>
        );
      })}
    </div>
  );
};
