import { PropsWithChildren, useEffect, useState } from "react";
import { useQuery } from "./useQuery";
import { Facet, KeyFacet, isKeyFacet } from "../types";
import { filteringQueryToHash, queryToHash } from "../utils";
import { FacetContext } from "./facetContext";
import { toQuery } from "../../hooks/searchHooks";
import * as api from "../datalayer/api";

const facetCache = new Map<string, Facet[]>();

const splitCategoryFacets = (facets: Facet[]): [KeyFacet[], Facet[]] => {
  return facets.reduce(
    ([c, all], facet) => {
      if (
        facet.categoryLevel != null &&
        facet.categoryLevel > 0 &&
        isKeyFacet(facet)
      ) {
        return [[...c, facet], all];
      }
      return [c, [...all, facet]];
    },
    [[] as KeyFacet[], [] as Facet[]]
  );
};

type FacetProviderProps = {
  ignoreFacets?: number[];
  delay?: number;
};

export const FacetProvider = ({
  ignoreFacets,
  children,
  delay = 30,
}: PropsWithChildren<FacetProviderProps>) => {
  const { query } = useQuery();
  const [isLoadingFacets, setIsLoadingFacets] = useState(false);
  const [facetsKey, setFacetsKey] = useState<string | null>(null);
  const [facets, setFacets] = useState<Facet[]>([]);
  const [categoryFacets, setCategoryFacets] = useState<KeyFacet[]>([]);

  useEffect(() => {
    const { query: q, range, stock, string } = query;
    const key = new URLSearchParams(
      filteringQueryToHash({ query: q, range, stock, string })
    ).toString();
    if (key !== facetsKey) {
      const to = setTimeout(() => {
        setFacetsKey(key);
      }, delay);
      return () => {
        clearTimeout(to);
      };
    }
  }, [query]);
  useEffect(() => {
    if (facetsKey == null) {
      return;
    }
    if (facetCache.has(facetsKey)) {
      const cached = facetCache.get(facetsKey) ?? [];

      const [cat, other] = splitCategoryFacets(cached);
      setFacets(other);
      setCategoryFacets(cat);
    }

    setIsLoadingFacets(true);
    api.facets(toQuery(query, ignoreFacets)).then((data) => {
      facetCache.set(facetsKey, data);
      const [cat, other] = data.reduce(
        ([c, all], facet) => {
          if (
            facet.categoryLevel != null &&
            facet.categoryLevel > 0 &&
            isKeyFacet(facet)
          ) {
            return [[...c, facet], all];
          }
          return [c, [...all, facet]];
        },
        [[] as KeyFacet[], [] as Facet[]]
      );
      setFacets(other);
      setCategoryFacets(cat);
      setIsLoadingFacets(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facetsKey]);

  return (
    <FacetContext.Provider
      value={{
        facets,
        categoryFacets,
        isLoadingFacets,
      }}
    >
      {children}
    </FacetContext.Provider>
  );
};
