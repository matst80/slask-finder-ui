import { ConvertedFacet, convertFacets } from "../hooks/suggestionUtils";
import {
  Cart,
  Item,
  ItemsQuery,
  ItemDetail,
  FacetListItem,
  Promotion,
  SessionData,
  UpdatedItem,
  PrometheusResponse,
  Facet,
  PageResult,
  Rules,
  FieldListItem,
  PopularQuery,
  Suggestion,
  ContentRecord,
  KeyFacet,
  RelationGroup,
} from "../types";

const baseUrl = "";

export const getPrometheusQueryUrl = (
  query: string,
  start: Date,
  end: Date,
  step = 14
) => {
  const params = new URLSearchParams({
    query,
    start: String(start.getTime() / 1000),
    end: String(end.getTime() / 1000),
    step: String(step),
  });
  return `/api/v1/query_range?${params.toString()}`;
};

export const getPrometheusData = async (url: string) => {
  return fetch(url, { method: "GET" }).then((res) =>
    toJson<PrometheusResponse>(res)
  );
};

export const getTriggerWords = () =>
  fetch(`${baseUrl}/api/trigger-words`)
    .then((d) => toJson<Record<string, number>>(d))
    .then((d) => {
      return Object.entries(d).map(([word, fieldId]) => ({
        word,
        fieldId: Number(fieldId),
      }));
    });

export const getPopularityRules = () =>
  fetch(`${baseUrl}/admin/rules/popular`).then((d) => toJson<Rules>(d));

export const setPopularityRules = (data: Rules) =>
  fetch(`${baseUrl}/admin/rules/popular`, {
    method: "POST",
    body: JSON.stringify(data),
  }).then((d) => toJson<Rules>(d));

export const autoSuggestResponse = (
  term: string
): { promise: Promise<Response>; cancel: () => void } => {
  const cancellationToken = new AbortController();

  const doCancel = () => {
    cancellationToken.abort("cancel");
  };
  return {
    promise: fetch(`${baseUrl}/api/suggest?q=${term}`, {
      signal: cancellationToken.signal,
    }).catch((e) => {
      if (e.name === "cancel") {
        return new Response(null, { status: 499 });
      }
      throw e;
    }),
    cancel: doCancel,
  };
};

export type SuggestionResponse = {
  suggestions: Suggestion[];
  items: Item[];
  facets: ConvertedFacet[];
};

export const handleSuggestResponse = (d: Response) => {
  if (!d.ok || d.body == null) {
    return {
      suggestions: [],
      items: [],
      facets: [],
    };
  }
  let part = 0;
  const suggestions: Suggestion[] = [];
  const items: Item[] = [];
  const facetsBuffer: KeyFacet[] = [];
  let buffer = "";
  const reader = d.body.getReader();
  const decoder = new TextDecoder();
  const pump = async (): Promise<SuggestionResponse> => {
    return reader
      .read()
      .catch((e) => {
        console.log("Error reading stream", e);
        return { done: true, value: null };
      })
      .then(({ done, value: dataChunk }) => {
        if (done || dataChunk == null) {
          return {
            suggestions: suggestions
              .filter((d) => d.match.toLowerCase() != d.prefix)
              .sort((a, b) => b.hits - a.hits),
            items,
            facets: convertFacets(facetsBuffer),
          };
        }

        buffer += decoder.decode(dataChunk);
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        lines.forEach((line) => {
          if (line.length < 2) {
            part++;
          } else {
            const item = JSON.parse(line);
            if (part === 0) {
              suggestions.push(item);
            } else if (part === 1) {
              items.push(item);
            } else {
              facetsBuffer.push(item);
            }
          }
        });

        return pump();
      });
  };
  return pump();
};

export const getKeyFieldsValues = (id: string | number) =>
  fetch(`${baseUrl}/api/values/${id}`).then((d) =>
    toJson<string[] | { min: number; max: number }[]>(d)
  );

export const getContentResults = (q: string) =>
  fetch(`${baseUrl}/api/content?${new URLSearchParams({ q })}`).then((d) =>
    readStreamed<ContentRecord>(d)
  );

export const facets = (query: string) =>
  fetch(`${baseUrl}/api/facets?${query}`, {
    //method: "GET",
    //body: JSON.stringify(query),
  }).then((d) => readStreamed<Facet>(d));

// export const streamFacets = (query: FacetQuery) =>
//   fetch(`${baseUrl}/api/stream/facets`, {
//     method: "POST",
//     body: JSON.stringify(query),
//   }).then((d) =>
//     d.ok ? (d.json() as Promise<FacetResult>) : Promise.reject(d)
//   );

export const getRelated = (id: number) =>
  fetch(`${baseUrl}/api/related/${id}`).then((d) => readStreamed<Item>(d));

export const getCompatible = (id: number) =>
  fetch(`${baseUrl}/api/compatible/${id}`).then((d) => readStreamed<Item>(d));

export const getPopularQueries = (q: string) =>
  fetch(
    `${baseUrl}/tracking/suggest?${new URLSearchParams({ q }).toString()}`
  ).then((d) => toJson<PopularQuery[]>(d));

export const getRelations = () => {
  return fetch(`${baseUrl}/api/relation-groups`).then((d) =>
    toJson<RelationGroup[]>(d)
  );
};

export const updateRelations = (data: RelationGroup[]) => {
  return fetch(`${baseUrl}/admin/relation-groups`, {
    method: "POST",
    body: JSON.stringify(data),
  }).then((d) => {
    if (d.ok) {
      return data;
    }
    throw new Error("Failed to update relations");
  });
};

const readStreamed = <T>(
  d: Response,
  afterSeparator?: (line: string) => void
): Promise<T[]> => {
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
    let isAfterSeparator = false;
    return reader?.read().then(async ({ done, value }): Promise<T[]> => {
      if (done) {
        return items;
      }

      buffer += decoder.decode(value);
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      const parsedItems = lines
        .map((line) => {
          if (line.length < 2) {
            isAfterSeparator = true;
            return null;
          }
          if (isAfterSeparator && afterSeparator != null) {
            afterSeparator(line);
            return null;
          } else {
            return JSON.parse(line) as T;
          }
        })
        .filter((d) => d != null);
      items = items.concat(...parsedItems);

      return pump();
    });
  };
  return pump();
};

export const streamItems = (
  query: string
  //onResults: (data: ItemResult) => void,
) =>
  fetch(`${baseUrl}/api/stream?${query}`, {
    //method: "GET",
    //body: JSON.stringify(query),
  }).then((d) => {
    let pageResult: PageResult = {
      totalHits: 0,
      page: 0,
      start: 0,
      pageSize: 0,
      end: 0,
    };
    return readStreamed<Item>(d, (line) => {
      pageResult = JSON.parse(line) as PageResult;
    }).then((items) => {
      return { ...pageResult, items };
    });
  });

async function toJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    return Promise.reject(await response.text());
  }
  return response.json();
}

export const getRawData = (id: string) =>
  fetch(`${baseUrl}/api/get/${id}`).then((d) =>
    d.ok ? (d.json() as Promise<ItemDetail>) : Promise.reject(d)
  );

export const getFacetList = () =>
  fetch(`${baseUrl}/api/facet-list`).then((d) => toJson<FacetListItem[]>(d));

export const getFacetMap = () =>
  fetch(`${baseUrl}/api/facet-list`)
    .then((d) => toJson<FacetListItem[]>(d))
    .then((d) => {
      return Object.fromEntries(d.map((item) => [item.id, item] as const));
    });

export const getFieldList = () =>
  fetch(`${baseUrl}/admin/fields`).then((d) =>
    toJson<Record<string, FieldListItem>>(d)
  );

export const getMissingFieldList = () =>
  fetch(`${baseUrl}/admin/missing-fields`).then((d) =>
    toJson<FieldListItem[]>(d)
  );

export const cleanFields = () =>
  fetch(`${baseUrl}/admin/clean-fields`).then((d) => d.ok);

// export const getCategories = () =>
//   fetch(`${baseUrl}/api/categories`).then((d) => toJson<Category[]>(d));

export const getItemIds = (query: ItemsQuery) =>
  fetch(`${baseUrl}/api/ids`, {
    method: "POST",
    body: JSON.stringify(query),
  })
    .then((d) => toJson<Record<number, never>>(d))
    .then((d) => Object.keys(d).map((nr) => Number(nr)));

export const getAdminItem = (id: number | string) =>
  fetch(`${baseUrl}/admin/item/${id}`).then((d) => toJson<ItemDetail>(d));

export const getPopularity = () =>
  fetch(`${baseUrl}/admin/sort/popular`).then((d) =>
    toJson<Record<string, number>>(d)
  );

export const getFieldPopularity = () =>
  fetch(`${baseUrl}/admin/sort/fields`).then((d) =>
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

export const createFacetFromField = (fieldKey: string) =>
  fetch(`${baseUrl}/admin/fields/${fieldKey}/add`);

export const deleteFacet = (fieldId: number | string) =>
  fetch(`${baseUrl}/admin/facets/${fieldId}`, { method: "DELETE" });

export const getFacets = () =>
  fetch(`${baseUrl}/admin/facets`).then((d) => toJson<FacetListItem[]>(d));

export const getStaticPositions = () =>
  fetch(`${baseUrl}/admin/sort/static`).then((d) =>
    toJson<Record<number, number>>(d)
  );

export const setStaticPositions = (data: Record<number, number>) =>
  fetch(`${baseUrl}/admin/sort/static`, {
    method: "POST",
    body: JSON.stringify(data),
  }).then((d) => toJson<Record<string, number>>(d));

export const updatePopularity = (overrides: Record<string, number>) =>
  fetch(`${baseUrl}/admin/sort/popular`, {
    method: "POST",
    body: JSON.stringify(overrides),
  }).then((d) => {
    if (d.ok) {
      return overrides;
    }
    throw new Error("Failed to update popularity");
  });

export const updateFieldPopularity = (overrides: Record<string, number>) =>
  fetch(`${baseUrl}/admin/sort/fields`, {
    method: "POST",
    body: JSON.stringify(overrides),
  }).then((d) => {
    if (d.ok) {
      return overrides;
    }
    throw new Error("Failed to update popularity");
  });

type AddToCartArgs = {
  id: number;
  quantity: number;
};

export const addToCart = (payload: AddToCartArgs) =>
  fetch(`${baseUrl}/cart/`, {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((d) => toJson<Cart>(d));

type ChangeQuantityArgs = {
  id: number;
  quantity: number;
};

export const changeQuantity = (payload: ChangeQuantityArgs) =>
  fetch(`${baseUrl}/cart/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }).then((d) => toJson<Cart>(d));

export const removeFromCart = ({ id }: { id: number }) =>
  fetch(`${baseUrl}/cart/${id}`, {
    method: "DELETE",
  }).then((d) => toJson<Cart>(d));

export const getCart = () =>
  fetch(`${baseUrl}/cart/`).then(async (d) => {
    if (d.status === 404) {
      return null;
    }
    return toJson<Cart>(d);
  });

export const getCartById = (id: string | number) =>
  fetch(`${baseUrl}/cart/${id}`).then((d) => toJson<Cart>(d));

export const getPromotions = () =>
  fetch(`${baseUrl}/api/promotion`).then((d) => toJson<Promotion[]>(d));

export const addPromotion = (data: Promotion) =>
  fetch(`${baseUrl}/api/promotion`, {
    method: "POST",
    body: JSON.stringify(data),
  }).then((d) => toJson<Promotion>(d));

export const removePromotion = (id: string) =>
  fetch(`${baseUrl}/api/promotion/${id}`, {
    method: "DELETE",
  }).then((d) => d.ok);

export const getTrackingPopularity = () =>
  fetch(`${baseUrl}/tracking/popularity`).then((d) =>
    toJson<Record<string, number>>(d)
  );

export const getTrackingQueries = () =>
  fetch(`${baseUrl}/tracking/queries`).then((d) =>
    toJson<Record<string, number>>(d)
  );

export const getTrackingSessions = () =>
  fetch(`${baseUrl}/tracking/sessions`).then((d) => toJson<SessionData[]>(d));

export const getTrackingFieldPopularity = () =>
  fetch(`${baseUrl}/tracking/field-popularity`).then((d) =>
    toJson<Record<number, number>>(d)
  );

export const getTrackingUpdates = () =>
  fetch(`${baseUrl}/tracking/updated`).then((d) => toJson<UpdatedItem[]>(d));
