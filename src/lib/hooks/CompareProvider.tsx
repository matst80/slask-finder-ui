"use client";
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
  diffWarning?: boolean;
  matchingFacetIds: Set<number>;
};

const LoadCompareState = (): Item[] => {
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

export const addProductToCompare = (item: Item) => {
  const current = LoadCompareState();
  const existing = current.find((i) => i.id === item.id);
  if (!existing) {
    current.push(item);
  }
  SaveCompareState(current);
  return current;
};

const CompareContext = createContext<CompareContextType | null>(null);

export const CompareProvider = ({
  children,
  compareAllFacets,
}: PropsWithChildren<{ compareAllFacets?: boolean }>) => {
  const [items, setItems] = useState<Item[]>(LoadCompareState());
  const [diffWarning, setDiffWarning] = useState(false);
  const [matchingFacetIds, setMatchingFacetIds] = useState<Set<number>>(
    new Set()
  );

  const value = useMemo(
    () => ({
      items,
      setItems,
      matchingFacetIds,
      diffWarning,
    }),
    [items, matchingFacetIds]
  );

  useEffect(() => {
    const itemFacets = items.map((item) => new Set(Object.keys(item.values)));

    const uniqueFacets = new Set<number>();
    const allFacets = new Set<number>();
    const first = itemFacets.pop();
    if (first) {
      first.forEach((id) => {
        if (itemFacets.every((s) => s.has(id))) {
          uniqueFacets.add(Number(id));
        }
      });
    }

    items.forEach((item) => {
      Object.keys(item.values).forEach((id) => {
        allFacets.add(Number(id));
      });
    });
    setDiffWarning(uniqueFacets.size < allFacets.size * 0.3);

    setMatchingFacetIds(compareAllFacets ? allFacets : uniqueFacets);
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
