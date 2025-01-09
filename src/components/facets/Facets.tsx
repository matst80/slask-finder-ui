import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Facet, FilteringQuery, isKeyFacet, isNumberFacet } from "../../types";
import { LoaderCircle } from "lucide-react";
import { stores } from "../../datalayer/stores";
import {
  useHashFacets,
  useHashQuery,
  useQueryHelpers,
} from "../../hooks/searchHooks";
import { byPriority } from "../../utils";

import { ColorFacetSelector } from "./ColorFacet";
import {
  FloatFacetSelector,
  IntegerFacetSelector,
} from "./NumericFacetSelectors";
import { KeyFacetSelector } from "./KeyFacetSelector";

type FacetContext = {
  facets: Facet[];
  selected: { id: number; value: FacetValue }[];
  setSelected: React.Dispatch<
    React.SetStateAction<
      {
        id: number;
        value: FacetValue;
      }[]
    >
  >;
};

const FacetSelectionContext = createContext<FacetContext | null>(null);

const isNumberSelection = (data: {
  id: number;
  value: FacetValue;
}): data is {
  id: number;
  value: NumberValue;
} => {
  return isNumberValue(data.value);
};

const isStringSelection = (data: {
  id: number;
  value: FacetValue;
}): data is { id: number; value: string | string[] } => {
  return typeof data.value === "string" || Array.isArray(data.value);
};

export const FacetList = ({
  facets,
  facetsToHide,
  children,
  onFilterChanged,
}: PropsWithChildren<{
  facets: Facet[];
  facetsToHide?: number[];
  onFilterChanged: (data: Pick<FilteringQuery, "range" | "string">) => void;
}>) => {
  const [selected, setSelected] = useState<{ id: number; value: FacetValue }[]>(
    []
  );
  useEffect(() => {
    const filter: Pick<FilteringQuery, "range" | "string"> = {
      range: selected
        .filter(isNumberSelection)
        .map((f) => ({ id: f.id, max: f.value.max, min: f.value.min })),
      string: selected.filter(isStringSelection),
    };
    onFilterChanged(filter);
    console.log(selected, filter);
  }, [selected, onFilterChanged]);
  const value = useMemo(
    () => ({ facets, selected, setSelected }),
    [facets, selected, setSelected]
  );
  return (
    <FacetSelectionContext.Provider value={value}>
      <aside className="w-full md:w-72">
        <h2 className="text-lg font-semibold mb-4">Filter</h2>
        <div>
          {facets.map((facet, i) => {
            if (facetsToHide != null && facetsToHide.includes(facet.id)) {
              return null;
            }
            if (facet.type === "color") {
              return (
                <ColorFacetSelector
                  {...facet}
                  key={`fld-${facet.id}-${facet.name}`}
                />
              );
            }
            if (isNumberFacet(facet)) {
              return (
                <FloatFacetSelector
                  {...facet}
                  key={`fld-${facet.id}-${facet.name}`}
                />
              );
            }
            if (isNumberFacet(facet)) {
              return (
                <IntegerFacetSelector
                  {...facet}
                  key={`fld-${facet.id}-${facet.name}`}
                />
              );
            }
            if (isKeyFacet(facet)) {
              return (
                <KeyFacetSelector
                  {...facet}
                  key={`fld-${facet.id}-${facet.name}`}
                  defaultOpen={i < 5}
                />
              );
            }
            return null;
          })}
        </div>

        {children}
      </aside>
    </FacetSelectionContext.Provider>
  );
};

const useFacetSelection = () => {
  const context = useContext(FacetSelectionContext);
  if (context == null) {
    throw new Error("useFacetSelection must be used within a FacetList");
  }
  return context;
};

type NumberValue = { min: number; max: number };
type FacetValue = string | string[] | NumberValue;

export const useFacetSelectors = (id: number) => {
  const {facets,selected, setSelected} = useFacetSelection();
  const currentFacet = useMemo(
    () => facets.find((f) => f.id === id),
    [id, facets]
  ); 
  return useMemo(() => {
    
    const addFilter = (value: FacetValue) => {
      setSelected((prev) => {
        const foundIdx = prev.findIndex((f) => f.id === id);
        if (foundIdx !== -1) {
          if (isNumberValue(value)) {
            return [...prev.filter((f) => f.id !== id), { id, value }];
          }
          const { value: prevValue } = prev[foundIdx] ?? {};

          if (typeof prevValue === "string" && typeof value === "string") {
            prev[foundIdx].value = [prevValue, value];
          } else if (
            Array.isArray(prev[foundIdx].value) &&
            typeof value === "string"
          ) {
            prev[foundIdx].value = [
              ...prev[foundIdx].value.filter((d) => d != value),
              value,
            ];
          }
          return prev;
        }
        return [...prev, { id, value }];
      });
    };
    const removeFilter = (value?: FacetValue) => {
      setSelected((prev) => {
        if (value == null) {
          return prev.filter((f) => f.id !== id);
        }
        const foundIdx = prev.findIndex((f) => f.id === id);

        if (foundIdx !== -1) {
          const { value: oldValue } = prev[foundIdx] ?? {};
          if (Array.isArray(oldValue)) {
            // console.log(
            //   "removeFilter",
            //   foundIdx,
            //   value,
            //   oldValue.filter((v) => v != value)
            // );
            prev[foundIdx].value = oldValue.filter((v) => v != value);
            if (prev[foundIdx].value.length == 0) {
              return prev.filter((f) => f.id !== id);
            }
            return [...prev];
          } else {
            return prev.filter((f) => f.id !== id);
          }
        }
        return prev;
      });
    };
    const selectedValue =
      selected?.find((f) => f.id === id)?.value ??
      currentFacet?.selected;
    return {
      addFilter,
      removeFilter,
      selected: selectedValue,
    };
  }, [currentFacet, id, selected, setSelected]);
};

export const isNumberValue = (value: unknown): value is NumberValue => {
  if (typeof value === "object" && value != null) {
    return typeof (value as NumberValue).min === "number";
  }
  return false;
};

export const isSelectedValue = (
  currentSelection: FacetValue | undefined,
  value: FacetValue | undefined
) => {
  if (currentSelection == null || value == null) {
    return false;
  }
  if (isNumberValue(value)) {
    if (!isNumberValue(currentSelection)) {
      return false;
    }
    return (
      currentSelection.min === value.min && currentSelection.max === value.max
    );
  }
  if (Array.isArray(value)) {
    console.log("WHAT?");
    return false;
  }
  // console.log("isSelected?", { currentSelection, value });
  if (Array.isArray(currentSelection)) {
    return currentSelection.includes(value);
  }

  return currentSelection == value;
};


export const Facets = () => {
  const { data: results, isLoading } = useHashFacets();
  const { setQuery } = useHashQuery();
  const {
    query: { stock },
    setStock,
  } = useQueryHelpers();

  const allFacets = useMemo(() => (results ?? []).sort(byPriority), [results]);
  const hasFacets = allFacets.length > 0;
  const updateFilters = useCallback(
    (data: Pick<FilteringQuery, "range" | "string">) => {
      setQuery((prev) => ({
        ...prev,
        ...data
      }));
    },
    [setQuery]
  );
  if (isLoading && !hasFacets) {
    return (
      <aside className="w-full md:w-72 animate-pulse">
        <h2 className="text-lg font-semibold mb-4">Filter</h2>
        <div className="my-10 flex items-center justify-center">
          <LoaderCircle className="size-10 animate-spin" />
        </div>
      </aside>
    );
  }

  

  return (
    hasFacets && (
      <FacetList facets={allFacets} onFilterChanged={updateFilters}>
        <div className="mb-4">
          <h3 className="font-medium mb-2">Select Store</h3>
          <select
            value={stock?.[0] ?? ""}
            onChange={(e) =>
              setStock(e.target.value === "" ? [] : [e.target.value])
            }
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Ingen butik</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.displayName.replace("Elgiganten ", "")}
              </option>
            ))}
          </select>
        </div>
      </FacetList>
    )
  );
  //     return (<aside className="w-full md:w-72">
  //       <h2 className="text-lg font-semibold mb-4">Filter</h2>
  //       <div>
  //         {allFacets.map((facet, i) => {
  //           if (facet.type === "color") {
  //             return (
  //               <ColorFacetSelector
  //                 {...facet}
  //                 key={`fld-${facet.id}-${facet.name}`}
  //               />
  //             );
  //           }
  //           if (isNumberFacet(facet)) {
  //             return (
  //               <FloatFacetSelector
  //                 {...facet}
  //                 key={`fld-${facet.id}-${facet.name}`}
  //               />
  //             );
  //           }
  //           if (isNumberFacet(facet)) {
  //             return (
  //               <IntegerFacetSelector
  //                 {...facet}
  //                 key={`fld-${facet.id}-${facet.name}`}
  //               />
  //             );
  //           }
  //           if (isKeyFacet(facet)) {
  //             return (
  //               <KeyFacetSelector
  //                 {...facet}
  //                 key={`fld-${facet.id}-${facet.name}`}
  //                 defaultOpen={i < 5}
  //               />
  //             );
  //           }
  //           return null;
  //         })}
  //       </div>

  //       <div className="mb-4">
  //         <h3 className="font-medium mb-2">Select Store</h3>
  //         <select
  //           value={stock?.[0] ?? ""}
  //           onChange={(e) =>
  //             setStock(e.target.value === "" ? [] : [e.target.value])
  //           }
  //           className="w-full p-2 border border-gray-300 rounded-md"
  //         >
  //           <option value="">Ingen butik</option>
  //           {stores.map((store) => (
  //             <option key={store.id} value={store.id}>
  //               {store.displayName.replace("Elgiganten ", "")}
  //             </option>
  //           ))}
  //         </select>
  //       </div>
  //     </aside>
  //   )
  // );
};
