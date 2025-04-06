import { useMemo } from "react";
import { X } from "lucide-react";
import { FacetListItem, Field, isNumberValue } from "../types";
import { stores } from "../datalayer/stores";
import { useFacetList } from "../hooks/searchHooks";
import { useQuery } from "../hooks/QueryProvider";
import { isDefined } from "../utils";

function toFilter(facets?: FacetListItem[]) {
  return (data: Field) => {
    const field = facets?.find((field) => field.id === data?.id);
    if (field == null) return null;

    const value = isNumberValue(data)
      ? field.type === "currency"
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
  const { data } = useFacetList();
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
      ...(keyFilters?.map(toFilter(data)) ?? []),
      ...(numberFilters?.map(toFilter(data)) ?? []),
    ].filter(isDefined);
  }, [keyFilters, numberFilters, data]);
  return (
    (selectedFilters.length > 0 || locationId != null) && (
      <div className="mb-6 flex flex-col md:flex-row items-center gap-2">
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
