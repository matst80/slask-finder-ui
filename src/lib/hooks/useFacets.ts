import { useContext } from "react";
import { FacetContext } from "./facetContext";

export const useFacets = () => {
  const context = useContext(FacetContext);
  if (context == null) {
    throw new Error("useFacets must be used within a FacetProvider");
  }
  return context;
};
