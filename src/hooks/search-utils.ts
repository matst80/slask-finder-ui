import { ItemsQuery, FilteringQuery, FacetQuery } from "../lib/types";
import { isDefined } from "../utils";

export const FIELD_SEPARATOR = ":";
export const ID_VALUE_SEPARATOR = "=";

export const queryFromHash = (hash: string): ItemsQuery => {
  const hashData = Object.fromEntries(new URLSearchParams(hash).entries());
  const integer = (hashData.i as string | undefined)
    ?.split(FIELD_SEPARATOR)
    .map((i) => {
      const [id, range] = i.split(ID_VALUE_SEPARATOR);
      const [min, max] = range.split("-").map(Number);
      return { id: Number(id), min, max };
    });
  const number = (hashData.n as string | undefined)
    ?.split(FIELD_SEPARATOR)
    .map((n) => {
      const [id, range] = n.split(ID_VALUE_SEPARATOR);
      const [min, max] = range.split("-").map(Number);
      return { id: Number(id), min, max };
    });

  const range = [...(integer ?? []), ...(number ?? [])];

  const string = (hashData.s as string | undefined)
    ?.split(FIELD_SEPARATOR)
    .map((s) => {
      const [id, value] = s.split(ID_VALUE_SEPARATOR);
      const exclude = value[0] === "!";
      const valueWithoutExclude = exclude ? value.substring(1) : value;
      return {
        id: Number(id),
        exclude,
        value: valueWithoutExclude.includes("||")
          ? valueWithoutExclude.split("||")
          : [valueWithoutExclude],
      };
    });
  const query = hashData.q;
  const stock = hashData.stock?.split(FIELD_SEPARATOR) ?? [];
  const sort = hashData.sort ?? "popular";
  let page = Number(hashData.page) ?? 0;
  let pageSize = Number(hashData.size) ?? 40;
  if (isNaN(pageSize)) {
    pageSize = 40;
  }
  if (isNaN(page)) {
    page = 0;
  }
  return { range, sort, page, pageSize, query, stock, string };
};

export const queryToHash = ({
  range,
  sort,
  page,
  pageSize,
  query,
  stock,
  filter,
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
  if (filter != null && filter.length > 0) {
    filterObj.filter = filter;
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
    string?.map(({ id, exclude = false, value }) => {
      if (Array.isArray(value) && value.length === 0) {
        // console.log("Empty value for id:", id);
        return undefined;
      }
      return `${id}${ID_VALUE_SEPARATOR}${exclude ? "!" : ""}${
        Array.isArray(value) ? value.join("||") : value
      }`;
    }) ?? [];
  if (strs.length) {
    result.s = strs.filter(isDefined).join(FIELD_SEPARATOR);
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
export const itemsKey = (data: ItemsQuery) => `items-` + queryToHash(data);
//const facetsKey = (data: FacetQuery) => "facets-" + facetQueryToHash(data);

export const toQuery = (data: ItemsQuery, ignoredFacets?: number[]): string => {
  const { range, sort, page, pageSize, query, stock, string, filter } = data;

  const result = new URLSearchParams({
    page: (page ?? 0).toString(),
    size: (pageSize ?? 40)?.toString(),
    sort: sort ?? "popular",
    query: query ?? "",
  });
  range?.forEach(({ id, min, max }) => {
    result.append("rng", `${id}:${min}-${max}`);
  });

  if (ignoredFacets != null && ignoredFacets.length > 0) {
    ignoredFacets.forEach((value) => result.append("sf", String(value)));
  }

  string
    ?.filter(({ value }) => Array.isArray(value) && value.length > 0)
    .forEach(({ id, exclude, value }) => {
      result.append(
        "str",
        `${id}:${exclude ? "!" : ""}${
          Array.isArray(value) ? value.join("||") : value
        }`
      );
    });
  if (filter?.length) {
    result.append("filter", filter);
  }
  stock?.forEach((s) => {
    result.append("stock", s);
  });

  return result.toString();
};
