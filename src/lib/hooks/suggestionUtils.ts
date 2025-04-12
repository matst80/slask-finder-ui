import { byPriority, isDefined } from "../../utils";
import {
  KeyFacet,
  isKeyFacet,
  FacetListItem,
  PopularFacet,
  PopularQuery,
} from "../types";

export type SuggestField = { name: string; id: number; value: string[] };
export type SuggestQuery = {
  term: string;
  fields: SuggestField[];
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
      .filter((d) => d.valueType != null)
      .sort(byPriority)
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
  [
    fieldId,
    {
      values,
      popularity: { value },
    },
  ]: [string, PopularFacet]
) => {
  if (facet == null) {
    return null;
  }
  return {
    name: facet.name,
    id: Number(fieldId),
    value: Object.keys(values),
    popularity: value,
  };
};

export const convertPopularQueries =
  (facetData: Record<string, FacetListItem>) =>
  (d: Record<string, PopularQuery>) => {
    return Object.entries(d)
      .map(
        ([
          term,
          {
            keyFacets,
            popularity: { value },
            query,
          },
        ]: [string, PopularQuery]) => {
          const fields = Object.entries(keyFacets)
            .map((field) => convertKeyFacetEntry(facetData[field[0]], field))
            .filter(isDefined)
            .sort(byPopularity);

          return { term, fields, popularity: value, query };
        }
      )
      .sort(byPopularity);
  };
