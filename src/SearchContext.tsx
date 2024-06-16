import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { SearchResult } from "./types";
import { search } from "./api";

type SearchContextType = {
  term: string;
  setTerm: (term: string) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  results?: SearchResult;
};

const SearchContext = createContext<SearchContextType | null>(null);

export const SearchContextProvider = ({
  children,
  pageSize,
}: PropsWithChildren<{ pageSize: number }>) => {
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(0);
  const [results, setResults] = useState<SearchResult | undefined>(undefined);
  useEffect(() => {
    if (term.length < 3) {
      return;
    }
    search(term, page, pageSize).then((data) => {
      setResults(data);
    });
  }, [term, page, pageSize]);
  return (
    <SearchContext.Provider
      value={{ term, setTerm, page, setPage, pageSize, results }}
    >
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
