import { useMemo, useCallback, useContext } from "react";
import { QueryContext } from "./queryContext";
import { useFacets } from "./useFacets";

export const useQueryKeyFacet = (id: number) => {
  const context = useContext(QueryContext);
  if (context == null) {
    throw new Error("useQuery must be used within a QueryProvider");
  }
  const { facets } = useFacets();
  const {
    query: { string: keys },
    setFilter,
    removeFilter,
  } = context;
  const facet = useMemo(() => facets.find((f) => f.id === id), [facets, id]);
  const filter = useMemo(
    () => new Set(keys?.find((f) => f.id === id)?.value ?? []),
    [keys, id]
  );
  const updateValue = useCallback(
    (value: string[]) => {
      setFilter(id, value as string[]);
    },
    [id, setFilter]
  );
  const addValue = useCallback(
    (value: string) => {
      filter?.add(value);
      setFilter(id, Array.from(filter));
    },
    [id, filter, setFilter]
  );
  const removeValue = useCallback(
    (value: string) => {
      filter?.delete(value);
      if (filter?.size === 0) {
        removeFilter(id);
      } else {
        setFilter(id, Array.from(filter));
      }
    },
    [id, filter, setFilter, removeFilter]
  );

  return { facet, filter, updateValue, addValue, removeValue };
};
