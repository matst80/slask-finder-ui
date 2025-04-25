import { createContext } from "react";
import {
  ItemsQuery,
  Facet,
  Item,
  NumberField,
  HistoryQuery,
  KeyFacet,
} from "../types";

type QueryContextType = {
  query: ItemsQuery;
  facets: Facet[];
  categoryFacets: KeyFacet[];
  setIgnoreFacets: React.Dispatch<React.SetStateAction<number[] | undefined>>;
  hits: Item[];
  totalHits: number;
  isLoading: boolean;
  isLoadingFacets: boolean;
  queryHistory: HistoryQuery[];
  setQuery: React.Dispatch<React.SetStateAction<ItemsQuery>>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (sort: string) => void;
  setStock: (stock: string[]) => void;
  setTerm: (term: string) => void;
  removeFilter: (id: number) => void;
  setFilter: (id: number, value: string[] | Omit<NumberField, "id">) => void;
};

export const QueryContext = createContext({} as QueryContextType);
