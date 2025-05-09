import { createContext } from "react";
import { ItemsQuery, Item, NumberField, HistoryQuery } from "../types";

export type AddPageResult = {
  currentPage: number;
  hasMorePages: boolean;
  totalPages: number;
};

type QueryContextType = {
  query: ItemsQuery;
  hits: Item[];
  totalHits: number;
  isLoading: boolean;
  queryHistory: HistoryQuery[];
  setQuery: React.Dispatch<React.SetStateAction<ItemsQuery>>;
  addPage: () => Promise<AddPageResult>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (sort: string) => void;
  setStock: (stock: string[]) => void;
  setTerm: (term: string) => void;
  setFilterTerm: (filter: string) => void;
  removeFilter: (id: number) => void;
  setFilter: (id: number, value: string[] | Omit<NumberField, "id">) => void;
};

export const QueryContext = createContext({} as QueryContextType);
