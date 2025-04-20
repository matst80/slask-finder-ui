import { useEffect } from "react";
import { useQuery } from "../lib/hooks/useQuery";
import { FilteringQuery } from "../lib/types";
import { mergeFilters } from "../lib/hooks/queryUtils";

export const QueryMerger = ({ query }: { query: FilteringQuery }) => {
  const { setQuery } = useQuery();
  useEffect(() => {
    setQuery((old) => ({ ...old, ...mergeFilters(old, query) }));
  }, [query, setQuery]);
  return null;
};
