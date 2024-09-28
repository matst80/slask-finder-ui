import { Item, Query, SearchResult, Suggestion } from "./types";

const baseUrl = "";

export const autoSuggest = (term: string): Promise<Suggestion[]> =>
  fetch(`${baseUrl}/api/suggest?q=${term}`).then((d) =>
    d.ok ? (d.json() as Promise<Suggestion[]>) : Promise.reject(d),
  );

// export const search = (term: string, page: number, pageSize: number) =>
//   fetch(`${baseUrl}/api/search?q=${term}&p=${page}&pz=${pageSize}`).then((d) =>
//     d.ok ? (d.json() as Promise<SearchResult>) : Promise.reject(d),
//   );

export const facets = (query: Query) =>
  fetch(`${baseUrl}/api/filter`, {
    method: "POST",
    body: JSON.stringify(query),
  }).then((d) =>
    d.ok
      ? (d.json() as Promise<Omit<SearchResult, "items" | "pageSize" | "page">>)
      : Promise.reject(d),
  );

export const streamFacets = (query: Query) =>
  fetch(`${baseUrl}/api/stream/facets`, {
    method: "POST",
    body: JSON.stringify(query),
  }).then((d) =>
    d.ok ? (d.json() as Promise<SearchResult>) : Promise.reject(d),
  );

export const streamItems = (
  query: Query,
  onResults: (data: Item[]) => void,
) => {
  return fetch(`${baseUrl}/api/stream`, {
    method: "POST",
    body: JSON.stringify(query),
  }).then((d) => {
    const reader = d.body?.getReader();
    const decoder = new TextDecoder();
    let items: Item[] = [];
    let buffer = "";
    const pump = (): unknown => {
      return reader?.read().then(({ done, value }) => {
        if (done) {
          return;
        }

        buffer += decoder.decode(value);
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        const parsedItems = lines
          .map((line) => {
            if (!line || line.length < 2) {
              return;
            }
            return JSON.parse(line) as Item;
          })
          .filter((d) => d != null) as Item[];
        items = items.concat(parsedItems);
        if (items.length > 0) {
          onResults(items);
        }

        return pump();
      });
    };
    return pump();
  });
};

export const getRawData = (id: string) =>
  fetch(`${baseUrl}/admin/get/${id}`).then((d) =>
    d.ok ? (d.json() as Promise<unknown>) : Promise.reject(d),
  );

export const trackClick = (id: string, position: number) =>
  fetch(`${baseUrl}/track/click?id=${id}&pos=${position}`).then((d) => d.ok);
