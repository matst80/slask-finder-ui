import { useMemo } from "react";
import { X } from "lucide-react";
import { Facets, Field, KeyField, NumberField } from "../types";
import { stores } from "../stores";
import { useFilters, useHashFacets, useQueryHelpers } from "../searchHooks";

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
  return typeof (filter as KeyField).value === "string";
};

const isNumberField = (filter: Field): filter is NumberField => {
  return "min" in filter && "max" in filter;
};

function toFilter(fieldType: "integer" | "float" | "key", facets?: Facets) {
  return (data: Field): KeyFilter | NumberFilter => {
    if (fieldType === "key" && isKeyField(data)) {
      const field = facets?.fields.find((field) => field.id === data.id);

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
      const fields =
        fieldType === "integer" ? facets?.integerFields : facets?.numberFields;
      const field = fields?.find((field) => field.id === data.id);

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
  const { data: results } = useHashFacets();
  const {
    query: { stock: locationId },
    setStock,
  } = useQueryHelpers();
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
      ...keyFilters.map(toFilter("key", results?.facets)),
      ...numberFilters.map(toFilter("float", results?.facets)),
      ...integerFilters.map(toFilter("integer", results?.facets)),
    ].filter(hasValue);
  }, [keyFilters, numberFilters, integerFilters, results]);
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
              onClick={() => setStock(undefined)}
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
                  : filter.value
              }
              onClick={() => {
                if (filter.fieldType === "key") {
                  removeKeyFilter(filter.key);
                } else if (filter.fieldType === "float") {
                  removeNumberFilter(filter.key);
                } else if (filter.fieldType === "integer") {
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
