import { SearchResult, Suggestion } from "./types";

const baseUrl = "https://slask-finder.tornberg.me"; //import.meta.env.BASE_URL;
//console.log(baseUrl);

export const autoSuggest = (term: string): Promise<Suggestion[]> =>
  fetch(`${baseUrl}/suggest?q=${term}`).then((d) =>
    d.ok ? (d.json() as Promise<Suggestion[]>) : Promise.reject(d)
  );

export const search = (term: string, page: number, pageSize: number) =>
  fetch(`${baseUrl}/search?q=${term}&page=${page}&pageSize=${pageSize}`).then(
    (d) => (d.ok ? (d.json() as Promise<SearchResult>) : Promise.reject(d))
  );
