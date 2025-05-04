/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseTranslationType,
  FacetQuery,
  FilteringQuery,
  ItemsQuery,
  PathInto,
} from "./types";

const FIELD_SEPARATOR = ":";
const ID_VALUE_SEPARATOR = "=";

export const queryToHash = ({
  range,
  sort,
  page,
  pageSize,
  query,
  stock,
  string,
}: ItemsQuery): string => {
  const filterObj = filteringQueryToHash({
    range,
    stock,
    query,
    string,
  });
  if (sort != null && sort !== "popular") {
    filterObj.sort = sort;
  }
  if (page != null) {
    filterObj.page = page.toString();
  }
  if (pageSize != null && pageSize !== 40) {
    filterObj.size = pageSize.toString();
  }
  return new URLSearchParams(filterObj).toString();
};

export const filteringQueryToHash = ({
  range,
  string,
  query,
  stock,
}: FilteringQuery): Record<string, string> => {
  const result: Record<string, string> = {};
  if (stock != null && stock.length > 0) {
    result.stock = stock.join(FIELD_SEPARATOR);
  }
  if (query != null && query.length > 0) {
    result.q = query;
  }
  const ints =
    range?.map(({ id, min, max }) => {
      return `${id}${ID_VALUE_SEPARATOR}${min}-${max}`;
    }) ?? [];
  if (ints.length > 0) {
    result.i = ints.join(FIELD_SEPARATOR);
  }

  // const nums =
  //   number?.map(({ id, min, max }) => {
  //     return `${id}${ID_VALUE_SEPARATOR}${min}-${max}`;
  //   }) ?? [];
  // if (nums.length > 0) {
  //   result.n = nums.join(FIELD_SEPARATOR);
  // }

  const strs =
    string?.map(({ id, value }) => {
      return `${id}${ID_VALUE_SEPARATOR}${
        Array.isArray(value) ? value.join("||") : value
      }`;
    }) ?? [];
  if (strs.length) {
    result.s = strs.join(FIELD_SEPARATOR);
  }
  return result;
};

export const facetQueryToHash = ({
  range,
  query,
  stock,
  string,
}: FacetQuery): string => {
  const obj = filteringQueryToHash({ range, stock, string, query });
  return new URLSearchParams(obj).toString();
};

export const toQuery = (data: ItemsQuery): string => {
  const { range, sort, page, pageSize, query, stock, string } = data;

  const result = new URLSearchParams({
    page: (page ?? 0).toString(),
    size: (pageSize ?? 40)?.toString(),
    sort: sort ?? "popular",
    query: query ?? "",
  });
  range?.forEach(({ id, min, max }) => {
    result.append("rng", `${id}:${min}-${max}`);
  });

  string?.forEach(({ id, value }) => {
    result.append(
      "str",
      `${id}:${Array.isArray(value) ? value.join("||") : value}`
    );
  });
  stock?.forEach((s) => {
    result.append("stock", s);
  });

  return result.toString();
};

export const setNestedValues = <T extends BaseTranslationType>(
  obj: T,
  onValue: (key: string, value: unknown) => void,
  path: (string & keyof T)[] = []
) => {
  Object.entries(obj).forEach(([key, value]) => {
    if (value && typeof value === "object") {
      setNestedValues(value, onValue, [...path, key]);
    } else {
      onValue([...path, key].join("."), value);
    }
  });
};

export const getNestedProperty = <T extends BaseTranslationType>(
  obj: T,
  path: PathInto<T> & string
) => {
  return path
    .split(".")
    .reduce(
      (result, key) => (result ? result[key] : undefined),
      obj as Record<string, any>
    );
};

export function extractFromObject(
  object: BaseTranslationType,
  path: Array<string>,
  index = 0
): string | undefined {
  const key = path[index];
  if (key === undefined) {
    return "";
  }
  const result = object[key];
  if (result == null) {
    return undefined;
  }
  if (typeof result === "object") {
    return extractFromObject(Object(result), path, index + 1);
  }
  return String(result);
}

export const replaceMustacheKeys = (
  text: string,
  object?: Record<string, any>
) =>
  object
    ? text.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
        const value = extractFromObject(object, key.trim().split("."));
        if (value === undefined) {
          return key;
        }
        return value;
      })
    : text;

export const matchValue = (
  itemValue: string[] | string | number | undefined,
  filterValue: string[] | string | number
): boolean => {
  if (typeof itemValue === "string" && typeof filterValue === "string") {
    return itemValue.toLowerCase() === filterValue.toLowerCase();
  }
  if (typeof itemValue === "number" && typeof filterValue === "number") {
    return itemValue === filterValue;
  }
  if (Array.isArray(itemValue) && Array.isArray(filterValue)) {
    return itemValue.some((value) =>
      filterValue.some((filter) => matchValue(value, filter))
    );
  }
  if (Array.isArray(itemValue) && typeof filterValue === "string") {
    return itemValue.some((value) => matchValue(value, filterValue));
  }
  if (typeof itemValue === "string" && Array.isArray(filterValue)) {
    return filterValue.some((value) => matchValue(itemValue, value));
  }
  return false;
};
