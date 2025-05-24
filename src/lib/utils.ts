/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseTranslationType,
  FacetQuery,
  FilteringQuery,
  Item,
  ItemDetail,
  ItemPrice,
  ItemsQuery,
  ItemValues,
  PathInto,
  ValueMap,
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
    string?.map(({ id, value, exclude = false }) => {
      return `${id}${ID_VALUE_SEPARATOR}${exclude ? "!" : ""}${
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
export const getRating = (values: ItemDetail["values"]) => {
  const rating = values[6];
  const numberOfRatings = values[7];
  if (rating == null || numberOfRatings == null) {
    return null;
  }
  return {
    rating: Number(rating) / 10,
    numberOfRatings: Number(numberOfRatings),
  };
};

export const convertProductValues = (values: Item["values"]) => {
  const rating = getRating(values);

  const soldBy = values[ValueMap.SoldBy];
  const isOutlet = values?.[ValueMap.Category1] == "Outlet";
  const grade = values[ValueMap.Grade];
  const price = getPrice(values);
  const stockLevel = values[ValueMap.StockLevel];
  const isOwn = soldBy == null || soldBy == "Elgiganten";

  return {
    isOwn,
    rating,
    soldBy,
    isOutlet,
    grade,
    price,
    stockLevel,
  };
};
export const getPrice = (values: ItemValues): ItemPrice => {
  const current = Number(values["4"]);
  const original = values["5"] != null ? Number(values["5"]) : null;
  const discount = values["8"] != null ? Number(values["8"]) : null;

  if (original != null && original > current) {
    return {
      isDiscounted: true,
      current,
      original,
      discount: discount ?? original - current,
    };
  }
  return {
    isDiscounted: false,
    current: Number(current ?? 0),
  };
};
