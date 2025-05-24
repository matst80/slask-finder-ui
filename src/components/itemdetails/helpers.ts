import {
  ItemValues,
  ItemsQuery,
  KeyField,
  NumberField,
  RelationGroup,
  RelationMatch,
  relationValueConverters,
} from "../../lib/types";
import { isDefined } from "../../utils";

export type PossibleValue = string | string[] | number | undefined;

export const getMatch = (
  requiredValue: string | number | string[],
  value: string | number | string[]
) => {
  if (Array.isArray(requiredValue)) {
    return requiredValue.some((part) =>
      Array.isArray(value)
        ? value.includes(part)
        : String(part) === String(value)
    );
  }
  return String(requiredValue) === String(value);
};

export const hasRequiredValue = (
  { value: requiredValue, exclude = false }: RelationMatch,
  value: PossibleValue
) => {
  if (value == null) return false;
  if (requiredValue == null) return value != null;

  const match = getMatch(requiredValue, value);
  if (exclude) {
    return !match;
  }
  return match;
};

export const isRangeFilter = (d: NumberField | KeyField): d is NumberField => {
  if ("value" in d) {
    return false;
  }
  if ("min" in d) {
    return true;
  }
  return true;
};

export const makeQuery = (
  group: RelationGroup,
  values: ItemValues
): ItemsQuery => {
  const globalFilters =
    group.additionalQueries?.map((query) => {
      return {
        id: query.facetId,
        exclude: query.exclude,
        value: Array.isArray(query.value)
          ? (query.value as string[])
          : [String(query.value)],
      };
    }) ?? [];
  const filters = group.relations.map((relation) => {
    const fromValue = values[relation.fromId];
    const converter =
      relationValueConverters[relation.converter] ??
      relationValueConverters.none;
    if (fromValue == null) return null;
    const filterValue = converter(fromValue);
    if (filterValue == null) return null;

    return {
      id: relation.toId,
      ...filterValue,
    };
  });
  const allFilters = [...globalFilters, ...filters.filter(isDefined)];
  const [string, range] = allFilters.reduce(
    (acc, filter) => {
      if (isRangeFilter(filter)) {
        acc[1]!.push(filter as NumberField);
      } else {
        acc[0]!.push(filter as KeyField);
      }
      return acc;
    },
    [[], []] as [ItemsQuery["string"], ItemsQuery["range"]]
  );

  return {
    page: 0,
    string,
    range,
  };
};
