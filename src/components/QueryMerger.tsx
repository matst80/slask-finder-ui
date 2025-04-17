import { useEffect } from "react";
import { useQuery, mergeFilters } from "../lib/hooks/QueryProvider";
import { FilteringQuery } from "../lib/types";

export const QueryMerger = ({ query }: { query: FilteringQuery }) => {
  const { setQuery } = useQuery();
  useEffect(() => {
    setQuery((old) => ({ ...old, ...mergeFilters(old, query) }));
  }, [query, setQuery]);
  return null;
};
