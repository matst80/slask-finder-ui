import { useMemo, useCallback, useContext } from "react";
import { isNumberFacet, NumberField } from "../types";
import { QueryContext } from "./queryContext";
import { useFacets } from "./useFacets";

export const useQueryRangeFacet = (id: number) => {
  const context = useContext(QueryContext);
  if (context === undefined) {
    throw new Error("useQuery must be used within a QueryProvider");
  }
  const { facets } = useFacets();
  const {
    query: { range },
    setFilter,
  } = context;
  const facet = useMemo(
    () => facets.find((f) => isNumberFacet(f) && f.id === id),
    [facets, id]
  );
  const filter = useMemo(() => {
    const f = range?.find((f) => f.id === id);
    return f ? { min: f.min, max: f.max } : facet?.result;
  }, [range, id, facet]);
  const updateValue = useCallback(
    (value: Omit<NumberField, "id">) => {
      setFilter(id, value);
    },
    [id, setFilter]
  );

  return { facet, filter, updateValue };
};
