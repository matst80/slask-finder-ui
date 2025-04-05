import { createContext, PropsWithChildren } from "react";
import { useQuery } from "./QueryProvider";
import { useFacetList, useFacets } from "./searchHooks";

type FacetContextType = {
  facets: Facet[] | undefined;
  isLoading: boolean;
  isValidating: boolean;
};

const FacetContext = createContext({} as FacetContextType);

export const FacetProvider = ({ children }: PropsWithChildren) => {
  const { query } = useQuery();
  const { data, isLoading, isValidating } = useFacetList();

  return (
    <FacetContext.Provider
      value={{
        facets: data ?? [],
        isLoading,
        isValidating,
      }}
    >
      {children}
    </FacetContext.Provider>
  );
};
