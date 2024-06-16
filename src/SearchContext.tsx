import { createContext, PropsWithChildren, useContext, useState } from "react";

type SearchContextType = {
  term: string;
  setTerm: (term: string) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
};

const SearchContext = createContext<SearchContextType | null>(null);

export const SearchContextProvider = ({
  children,
  pageSize,
}: PropsWithChildren<{ pageSize: number }>) => {
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(0);
  return (
    <SearchContext.Provider value={{ term, setTerm, page, setPage, pageSize }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (context == null) {
    throw new Error(
      "useSearchContext must be used within a SearchContextProvider"
    );
  }
  return context;
};
