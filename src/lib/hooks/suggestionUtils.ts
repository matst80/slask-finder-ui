import { byPriority, isDefined } from "../../utils";
import {
  KeyFacet,
  isKeyFacet,
  FacetListItem,
  PopularFacet,
  PopularQuery,
} from "../types";

export type SuggestField = {
  name: string;
  id: number;
  values: {
    value: string;
    popularity: number;
  }[];
  popularity: number;
};
export type SuggestQuery = {
  type: "query";
  fields: SuggestField[];
  popularity: number;
  query: string;
};

export type FlatFacetValue = Omit<KeyFacet, "result" | "selected"> & {
  value: string;
  hits: number;
};

export type ConvertedFacet = Omit<
  KeyFacet,
  "result" | "selected" | "valueType"
> & {
  values: { value: string; hits: number }[];
  valueType: string;
};

export const convertFacets = (facets: KeyFacet[]): ConvertedFacet[] => {
  return (
    facets
      .filter(isKeyFacet)
      .filter(
        (d) =>
          d.valueType != null ||
          (d.categoryLevel != null && d.categoryLevel > 0)
      )
      .sort(byPriority)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ result: { values }, selected: _, ...rest }) => ({
        ...rest,
        values: Object.entries(values ?? {})
          .sort((a, b) => b[1] - a[1])
          .slice(undefined, 10)
          .map(([value, hits]) => ({ value, hits })),
      })) ?? []
  );
};

const byPopularity = (a: { popularity: number }, b: { popularity: number }) =>
  b.popularity - a.popularity;

const convertKeyFacetEntry = (
  facet: FacetListItem | undefined,
  { id, values, score }: PopularFacet
) => {
  if (facet == null) {
    return null;
  }
  return {
    name: facet.name,
    id,
    values: values.map(({ value, score }) => ({ value, popularity: score })),
    popularity: score,
  };
};

export const convertPopularQueries =
  (facetData: Record<string, FacetListItem>) =>
  (d: PopularQuery[]): SuggestQuery[] => {
    return d
      .map(({ facets, query, score }) => {
        const fields = facets
          .map((field) => convertKeyFacetEntry(facetData[field.id], field))
          .filter(isDefined)
          .sort(byPopularity);

        return {
          fields,
          popularity: score,
          query,
          type: "query",
        } satisfies SuggestQuery;
      })
      .sort(byPopularity);
  };
