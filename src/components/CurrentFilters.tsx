import { useMemo } from "react";
import { useSearchContext } from "../SearchContext";
import { X } from "lucide-react";
import { Facets } from "../types";
import { stores } from "../stores";

type KeyFilter = {
  key: string;
  name?: string;
  type: "key";
  value: string;
};

type NumberFilter = {
  key: string;
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
    string,
    undefined | string | { min: number; max: number },
  ]): KeyFilter | NumberFilter => {
    if (type === "key" && typeof value === "string") {
      return {
        key,
        name: facets?.fields.find((field) => String(field.id) === key)?.name,
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
        key,
        name: fields?.find((field) => String(field.id) === key)?.name,
        type,
        value,
      };
    }
    throw new Error("Invalid filter type");
  };
}

function remove<T>(key: string) {
  return (prev: { [key: string]: T }) => {
    const { [key]: _, ...rest } = prev;
    return rest;
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
  const {
    keyFilters,
    numberFilters,
    integerFilters,
    results,
    setIntegerFilters,
    setKeyFilters,
    setNumberFilters,
    term,
    setTerm,
    locationId,
    setLocationId,
  } = useSearchContext();

  const selectedFilters = useMemo(() => {
    return [
      ...Object.entries(keyFilters).map(toFilter("key", results?.facets)),
      ...Object.entries(numberFilters).map(toFilter("float", results?.facets)),
      ...Object.entries(integerFilters).map(
        toFilter("integer", results?.facets),
      ),
    ].filter(hasValue);
  }, [keyFilters, numberFilters, integerFilters, results]);
  return (
    (selectedFilters.length > 0 || term != "" || locationId != null) && (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Selected Filters:
        </h3>
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
                  setKeyFilters(remove(filter.key));
                } else if (filter.type === "float") {
                  setNumberFilters(remove(filter.key));
                } else if (filter.type === "integer") {
                  setIntegerFilters(remove(filter.key));
                }
              }}
            />
          ))}
        </div>
      </div>
    )
  );
};
