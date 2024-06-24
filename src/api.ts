import { Query, SearchResult, Suggestion } from "./types";

const baseUrl = "http://localhost:8080";
//const baseUrl = "https://slask-finder.tornberg.me";

export const autoSuggest = (term: string): Promise<Suggestion[]> =>
  fetch(`${baseUrl}/suggest?q=${term}`).then((d) =>
    d.ok ? (d.json() as Promise<Suggestion[]>) : Promise.reject(d)
  );

export const search = (term: string, page: number, pageSize: number) =>
  fetch(`${baseUrl}/search?q=${term}&p=${page}&pz=${pageSize}`).then((d) =>
    d.ok ? (d.json() as Promise<SearchResult>) : Promise.reject(d)
  );

export const filter = (query: Query) =>
  fetch(`${baseUrl}/filter`, {
    method: "POST",
    body: JSON.stringify(query),
  }).then((d) =>
    d.ok ? (d.json() as Promise<SearchResult>) : Promise.reject(d)
  );
