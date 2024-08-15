import { Query, SearchResult, Suggestion } from "./types";

const baseUrl = "";

export const autoSuggest = (term: string): Promise<Suggestion[]> =>
  fetch(`${baseUrl}/api/suggest?q=${term}`).then((d) =>
    d.ok ? (d.json() as Promise<Suggestion[]>) : Promise.reject(d)
  );

export const search = (term: string, page: number, pageSize: number) =>
  fetch(`${baseUrl}/api/search?q=${term}&p=${page}&pz=${pageSize}`).then((d) =>
    d.ok ? (d.json() as Promise<SearchResult>) : Promise.reject(d)
  );

export const filter = (query: Query) =>
  fetch(`${baseUrl}/api/filter`, {
    method: "POST",
    body: JSON.stringify(query),
  }).then((d) =>
    d.ok ? (d.json() as Promise<SearchResult>) : Promise.reject(d)
  );

export const getRawData = (id: string) =>
  fetch(`${baseUrl}/admin/get/${id}`).then((d) =>
    d.ok ? (d.json() as Promise<unknown>) : Promise.reject(d)
  );

export const trackClick = (id: string, position: number) =>
  fetch(`${baseUrl}/track/click?id=${id}&pos=${position}`).then((d) => d.ok);
