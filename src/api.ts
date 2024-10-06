import {
  Cart,
  Category,
  FacetQuery,
  Item,
  ItemsQuery,
  FacetResult,
  ItemDetail,
  FacetListItem,
} from "./types";

const baseUrl = "";

export const autoSuggestResponse = (
  term: string
): { promise: Promise<Response>; cancel: () => void } => {
  const cancellationToken = new AbortController();

  const doCancel = () => {
    cancellationToken.abort("new search started");
  };
  return {
    promise: fetch(`${baseUrl}/api/suggest?q=${term}`, {
      signal: cancellationToken.signal,
    }),
    cancel: doCancel,
  };
};

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
      : Promise.reject(d)
  );

export const streamFacets = (query: FacetQuery) =>
  fetch(`${baseUrl}/api/stream/facets`, {
    method: "POST",
    body: JSON.stringify(query),
  }).then((d) =>
    d.ok ? (d.json() as Promise<FacetResult>) : Promise.reject(d)
  );

export const getRelated = (id: number) =>
  fetch(`${baseUrl}/api/related/${id}`).then((d) => readStreamed<Item>(d));

const readStreamed = <T>(d: Response): Promise<T[]> => {
  if (!d.ok) {
    return Promise.reject(d);
  }
  if (d.body == null) {
    return Promise.resolve([] as T[]);
  }
  const reader = d.body.getReader();
  const decoder = new TextDecoder();
  let items: T[] = [];
  let buffer = "";
  const pump = async (): Promise<T[]> => {
    return reader?.read().then(async ({ done, value }): Promise<T[]> => {
      if (done) {
        return items;
      }

      buffer += decoder.decode(value);
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      const parsedItems = lines
        .map((line) => {
          return JSON.parse(line) as T;
        })
        .filter((d) => d != null);
      items = items.concat(...parsedItems);

      return pump();
    });
  };
  return pump();
};

export const streamItems = (
  query: ItemsQuery
  //onResults: (data: ItemResult) => void,
): Promise<Item[]> => {
  return fetch(`${baseUrl}/api/stream`, {
    method: "POST",
    body: JSON.stringify(query),
  }).then((d) => readStreamed<Item>(d));
};

async function toJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    return Promise.reject(await response.text());
  }
  return response.json();
}

export const getRawData = (id: string) =>
  fetch(`${baseUrl}/admin/get/${id}`).then((d) =>
    d.ok ? (d.json() as Promise<ItemDetail>) : Promise.reject(d)
  );

export const trackClick = (id: string, position: number) =>
  fetch(`${baseUrl}/api/track/click?id=${id}&pos=${position}`).then(
    (d) => d.ok
  );

export const getFacetList = () =>
  fetch(`${baseUrl}/api/facet-list`).then((d) => toJson<FacetListItem[]>(d));

export const getCategories = () =>
  fetch(`${baseUrl}/api/categories`).then((d) => toJson<Category[]>(d));

export const getItemIds = (query: ItemsQuery) =>
  fetch(`${baseUrl}/api/ids`, {
    method: "POST",
    body: JSON.stringify(query),
  })
    .then((d) => toJson<Record<number, never>>(d))
    .then((d) => Object.keys(d).map((nr) => Number(nr)));

export const getPopularity = () =>
  fetch(`${baseUrl}/admin/sort/popular`).then((d) =>
    toJson<Record<string, number>>(d)
  );

export const updateCategories = (
  ids: number[],
  updates: { id: number; value: string }[]
) =>
  fetch(`${baseUrl}/admin/key-values`, {
    method: "PUT",
    body: JSON.stringify({ ids, updates }),
  }).then((d) => {
    return d.ok;
  });

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
  id: number;
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
