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

const LoadCompareState = () => {
  if (!globalThis.localStorage) {
    return [];
  }
  const savedState = globalThis.localStorage.getItem("compareState");
  if (savedState) {
    return JSON.parse(savedState);
  }
  return [];
};
const SaveCompareState = (state: Item[]) => {
  if (!globalThis.localStorage) {
    return;
  }
  localStorage.setItem("compareState", JSON.stringify(state));
};

const ComparePersister = () => {
  const { items } = useCompareContext();
  useEffect(() => {
    requestAnimationFrame(() => {
      SaveCompareState(items);
    });
  }, [items]);
  return null;
};

const CompareContext = createContext<CompareContextType | null>(null);

export const CompareProvider = ({
  children,
  compareAllFacets,
}: PropsWithChildren<{ compareAllFacets?: boolean }>) => {
  const [items, setItems] = useState<Item[]>(LoadCompareState());
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
    if (compareAllFacets) {
      items.forEach((item) => {
        Object.keys(item.values).forEach((id) => {
          uniqueFacets.add(Number(id));
        });
      });
    } else {
      const first = itemFacets.pop();
      if (first) {
        first.forEach((id) => {
          if (itemFacets.every((s) => s.has(id))) {
            uniqueFacets.add(Number(id));
          }
        });
      }
    }

    setMatchingFacetIds(uniqueFacets);
  }, [items]);

  return (
    <CompareContext.Provider value={value}>
      {children}
      <ComparePersister />
    </CompareContext.Provider>
  );
};

export const useCompareContext = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompareContext must be used within a CompareProvider");
  }
  return context;
};
