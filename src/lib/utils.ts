import { FacetQuery, FilteringQuery, ItemsQuery } from "./types";

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
