import {
  Cart,
  Category,
  FacetQuery,
  Item,
  ItemResult,
  ItemsQuery,
  FacetResult,
  Suggestion,
  ItemDetail,
} from "./types";

const baseUrl = "";

export const autoSuggest = (term: string): Promise<Suggestion[]> =>
  fetch(`${baseUrl}/api/suggest?q=${term}`).then((d) =>
    d.ok ? (d.json() as Promise<Suggestion[]>) : Promise.reject(d),
  );

// export const search = (term: string, page: number, pageSize: number) =>
//   fetch(`${baseUrl}/api/search?q=${term}&p=${page}&pz=${pageSize}`).then((d) =>
//     d.ok ? (d.json() as Promise<SearchResult>) : Promise.reject(d),
//   );

export const facets = (query: ItemsQuery) =>
  fetch(`${baseUrl}/api/filter`, {
    method: "POST",
    body: JSON.stringify(query),
  }).then((d) =>
    d.ok
      ? (d.json() as Promise<Omit<FacetResult, "items" | "pageSize" | "page">>)
      : Promise.reject(d),
  );

export const streamFacets = (query: FacetQuery) =>
  fetch(`${baseUrl}/api/stream/facets`, {
    method: "POST",
    body: JSON.stringify(query),
  }).then((d) =>
    d.ok ? (d.json() as Promise<FacetResult>) : Promise.reject(d),
  );

export const streamItems = (
  query: ItemsQuery,
  //onResults: (data: ItemResult) => void,
): Promise<ItemResult> => {
  return fetch(`${baseUrl}/api/stream`, {
    method: "POST",
    body: JSON.stringify(query),
  }).then((d) => {
    if (!d.ok) {
      return Promise.reject(d);
    }
    if (d.body == null) {
      return [];
    }
    const reader = d.body.getReader();
    const decoder = new TextDecoder();
    let items: ItemResult = [];
    let buffer = "";
    const pump = async (): Promise<ItemResult> => {
      return reader
        ?.read()
        .then(async ({ done, value }): Promise<ItemResult> => {
          if (done) {
            return items;
          }

          buffer += decoder.decode(value);
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          const parsedItems = lines
            .map((line) => {
              return JSON.parse(line) as Item;
            })
            .filter((d) => d != null);
          items = items.concat(parsedItems);

          return pump();
        });
    };
    return pump();
  });
};

async function toJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    return Promise.reject(await response.text());
  }
  return response.json();
}

export const getRawData = (id: string) =>
  fetch(`${baseUrl}/admin/get/${id}`).then((d) =>
    d.ok ? (d.json() as Promise<ItemDetail>) : Promise.reject(d),
  );

export const trackClick = (id: string, position: number) =>
  fetch(`${baseUrl}/api/track/click?id=${id}&pos=${position}`).then(
    (d) => d.ok,
  );

type FacetListItem = {
  id: number;
  name: string;
  prio?: number;
  count: number;
  description?: string;
};

export const getFacetList = () =>
  fetch(`${baseUrl}/api/facet-list`).then((d) => toJson<FacetListItem[]>(d));

export const getCategories = () =>
  fetch(`${baseUrl}/api/categories`).then((d) => toJson<Category[]>(d));

export const getPopularity = () =>
  fetch(`${baseUrl}/admin/sort/popular`).then((d) =>
    toJson<Record<string, number>>(d),
  );

export const updatePopularity = (overrides: Record<string, number>) => {
  return fetch(`${baseUrl}/admin/sort/popular`, {
    method: "POST",
    body: JSON.stringify(overrides),
  }).then((d) => {
    if (d.ok) {
      return overrides;
    }
    throw new Error("Failed to update popularity");
  });
};

type AddToCartArgs = {
  id: string;
  quantity: number;
};

export const addToCart = (payload: AddToCartArgs) => {
  return fetch(`${baseUrl}/cart/`, {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((d) => toJson<Cart>(d));
};

type ChangeQuantityArgs = {
  id: number;
  quantity: number;
};

export const changeQuantity = (payload: ChangeQuantityArgs) => {
  return fetch(`${baseUrl}/cart/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }).then((d) => toJson<Cart>(d));
};

export const removeFromCart = ({ id }: { id: number }) =>
  fetch(`${baseUrl}/cart/${id}`, {
    method: "DELETE",
  }).then((d) => toJson<Cart>(d));

export const getCart = () =>
  fetch(`${baseUrl}/cart`).then((d) => toJson<Cart>(d));
