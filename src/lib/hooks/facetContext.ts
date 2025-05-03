import { createContext } from "react";
import { Facet, KeyFacet } from "../types";

export type AddPageResult = {
  currentPage: number;
  hasMorePages: boolean;
  totalPages: number;
};

type FacetContextType = {
  facets: Facet[];
  categoryFacets: KeyFacet[];
  isLoadingFacets: boolean;
};

export const FacetContext = createContext<FacetContextType | null>(null);
