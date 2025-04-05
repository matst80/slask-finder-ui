import { useMemo } from "react";
import { X } from "lucide-react";
import { FacetListItem, Field, KeyField, NumberField } from "../types";
import { stores } from "../datalayer/stores";
import { useFacetList } from "../hooks/searchHooks";
import { useQuery } from "../hooks/QueryProvider";

type KeyFilter = {
  key: number;
  name?: string;
  type?: string;
  fieldType: "key";
  value: string;
};

type NumberFilter = {
  key: number;
  name?: string;
  type?: string;
  fieldType: "integer" | "float";
  value: {
    min: number;
    max: number;
  };
};

type Filter = KeyFilter | NumberFilter;

const isNumberFilter = (filter: Filter): filter is NumberFilter => {
  return (
    typeof filter.value === "object" &&
    "min" in filter.value &&
    "max" in filter.value
  );
};

const hasValue = (filter: unknown): filter is Filter => {
  if (!filter) return false;
  return (filter as { value: unknown }).value !== undefined;
};

const isKeyField = (filter: Field): filter is KeyField => {
  return (
    typeof (filter as KeyField).value === "string" ||
    Array.isArray((filter as KeyField).value)
  );
};

const isNumberField = (filter: Field): filter is NumberField => {
  return "min" in filter && "max" in filter;
};

function toFilter(
  fieldType: "integer" | "float" | "key",
  facets?: FacetListItem[]
) {
  return (data: Field): KeyFilter | NumberFilter | KeyFilter[] => {
    const field = facets?.find((field) => field.id === data.id);
    if (fieldType === "key" && isKeyField(data)) {
      if (Array.isArray(data.value)) {
        return data.value.map((value) => ({
          key: data.id,
          name: field?.name,
          type: field?.type,
          fieldType: "key",
          value,
        }));
      }
      return {
        key: data.id,
        name: field?.name,
        type: field?.type,
        fieldType: "key",
        value: data.value,
      };
    }
    if (
      (fieldType === "integer" || fieldType === "float") &&
      isNumberField(data)
    ) {
      return {
        key: data.id,
        name: field?.name,
        type: field?.type,
        fieldType,
        value: {
          min: data.min,
          max: data.max,
        },
      };
    }
    throw new Error("Invalid filter type");
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
    setQuery,
  } = useQuery();

  const selectedFilters = useMemo(() => {
    return [
      ...(keyFilters?.flatMap(toFilter("key", data)) ?? []),
      ...(numberFilters?.map(toFilter("float", data)) ?? []),
    ].filter(hasValue);
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
              key={filter.key}
              name={filter.name}
              value={
                isNumberFilter(filter)
                  ? filter.type === "currency"
                    ? `${filter.value.min / 100}kr - ${
                        filter.value.max / 100
                      } kr`
                    : `${filter.value.min} - ${filter.value.max}`
                  : Array.isArray(filter.value)
                  ? filter.value.join(", ")
                  : filter.value
              }
              onClick={() => {
                console.log("remove filter", filter);
                // if (filter.fieldType === "key") {
                //   removeKeyFilter(
                //     filter.key,
                //     Array.isArray(filter.value) ? undefined : filter.value
                //   );
                // } else {
                //   removeNumberFilter(filter.key);
                // }
              }}
            />
          ))}
        </div>
      </div>
    )
  );
};
