import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Item } from "../types";

type CompareContextType = {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  matchingFacetIds: Set<number>;
};

const CompareContext = createContext<CompareContextType | null>(null);

export const CompareProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<Item[]>([]);
  const [matchingFacetIds, setMatchingFacetIds] = useState<Set<number>>(
    new Set()
  );

  const value = useMemo(
    () => ({
      items,
      setItems,
      matchingFacetIds,
    }),
    [items, matchingFacetIds]
  );

  useEffect(() => {
    const itemFacets = items.map((item) => new Set(Object.keys(item.values)));

    const uniqueFacets = new Set<number>();

    const first = itemFacets.pop();
    if (first) {
      first.forEach((id) => {
        if (itemFacets.every((s) => s.has(id))) {
          uniqueFacets.add(Number(id));
        }
      });
    }

    setMatchingFacetIds(uniqueFacets);
  }, [items]);

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
};

export const useCompareContext = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompareContext must be used within a CompareProvider");
  }
  return context;
};
