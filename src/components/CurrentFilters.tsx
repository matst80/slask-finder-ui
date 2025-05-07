import { useMemo } from "react";
import { X } from "lucide-react";
import { FacetListItem, Field, isNumberValue } from "../lib/types";
import { stores } from "../lib/datalayer/stores";
import { useFacetMap } from "../hooks/searchHooks";
import { useQuery } from "../lib/hooks/useQuery";
import { isDefined } from "../utils";
import { useIsAdmin } from "../adminHooks";
import { useAdmin } from "../hooks/appState";

function toFilter(facets?: Record<number, FacetListItem>, hideHidden = true) {
  return (data: Field) => {
    const field = facets?.[data?.id];
    if (field == null || (hideHidden && field.hide)) return null;

    const value = isNumberValue(data)
      ? field.valueType === "currency"
        ? `${data.min / 100}kr - ${data.max / 100} kr`
        : `${data.min} - ${data.max}`
      : Array.isArray(data.value)
      ? data.value.join(", ")
      : data.value;

    return {
      ...field,
      value,
    };
  };
}

type FilterItemProps = { name?: string; value: string; onClick: () => void };
const FilterItem = ({ name, value, onClick }: FilterItemProps) => {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
      {name != null ? `${name}: ${value}` : value}
      <button
        onClick={onClick}
        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-200 text-blue-500 hover:bg-blue-300"
      >
        <X size={12} />
      </button>
    </span>
  );
};

export const CurrentFilters = () => {
  const { data } = useFacetMap();
  const [isAdmin] = useAdmin();
  const {
    query: { stock },
    setStock,
  } = useQuery();
  const locationId = stock?.[0];
  const {
    query: { string: keyFilters, range: numberFilters },
    removeFilter,
  } = useQuery();

  const selectedFilters = useMemo(() => {
    return [
      ...(keyFilters?.map(toFilter(data, !isAdmin)) ?? []),
      ...(numberFilters?.map(toFilter(data, !isAdmin)) ?? []),
    ].filter(isDefined);
  }, [keyFilters, numberFilters, data]);
  return (
    (selectedFilters.length > 0 || locationId != null) && (
      <div className="mb-6 hidden md:flex flex-col md:flex-row items-center gap-2">
        <h3 className="text-sm font-medium text-gray-700">Selected Filters:</h3>
        <div className="flex flex-wrap gap-2">
          {locationId != null && (
            <FilterItem
              name="Butik"
              value={
                stores.find((d) => d.id === locationId)?.displayName ??
                "Unknown store"
              }
              onClick={() => setStock([])}
            />
          )}
          {selectedFilters.map((filter) => (
            <FilterItem
              key={filter.id}
              name={filter.name}
              value={filter.value}
              onClick={() => {
                removeFilter(filter.id);
              }}
            />
          ))}
        </div>
      </div>
    )
  );
};
