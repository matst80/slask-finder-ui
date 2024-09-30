import { useMemo } from "react";
import { useFilters, useSearchContext } from "../SearchContext";
import { X } from "lucide-react";
import { Facets } from "../types";
import { stores } from "../stores";

type KeyFilter = {
  key: number;
  name?: string;
  type: "key";
  value: string;
};

type NumberFilter = {
  key: number;
  name?: string;
  type: "integer" | "float";
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

function toFilter(type: "integer" | "float" | "key", facets?: Facets) {
  return ([key, value]: [
    number | string,
    undefined | string | { min: number; max: number }
  ]): KeyFilter | NumberFilter => {
    if (type === "key" && typeof value === "string") {
      return {
        key: Number(key),
        name: facets?.fields.find((field) => field.id === Number(key))?.name,
        type: "key",
        value: value || "",
      };
    }
    if (type === "integer" || type === "float") {
      if (typeof value !== "object" || !("min" in value) || !("max" in value)) {
        throw new Error("Invalid number filter");
      }
      const fields =
        type === "integer" ? facets?.integerFields : facets?.numberFields;
      return {
        key: Number(key),
        name: fields?.find((field) => field.id === Number(key))?.name,
        type,
        value,
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
  const { results, term, setTerm, locationId, setLocationId } =
    useSearchContext();
  const {
    keyFilters,
    numberFilters,
    integerFilters,
    removeIntegerFilter,
    removeKeyFilter,
    removeNumberFilter,
  } = useFilters();

  const selectedFilters = useMemo(() => {
    return [
      ...Object.entries(keyFilters).map(toFilter("key", results?.facets)),
      ...Object.entries(numberFilters).map(toFilter("float", results?.facets)),
      ...Object.entries(integerFilters).map(
        toFilter("integer", results?.facets)
      ),
    ].filter(hasValue);
  }, [keyFilters, numberFilters, integerFilters, results]);
  return (
    (selectedFilters.length > 0 || term != "" || locationId != null) && (
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
              onClick={() => setLocationId(undefined)}
            />
          )}
          {term != "" && (
            <FilterItem
              name="Sökning"
              value={term}
              onClick={() => setTerm("")}
            />
          )}
          {selectedFilters.map((filter) => (
            <FilterItem
              key={filter.key}
              name={filter.name}
              value={
                isNumberFilter(filter)
                  ? `${filter.value.min}-${filter.value.max}`
                  : filter.value
              }
              onClick={() => {
                if (filter.type === "key") {
                  removeKeyFilter(filter.key);
                } else if (filter.type === "float") {
                  removeNumberFilter(filter.key);
                } else if (filter.type === "integer") {
                  removeIntegerFilter(filter.key);
                }
              }}
            />
          ))}
        </div>
      </div>
    )
  );
};
