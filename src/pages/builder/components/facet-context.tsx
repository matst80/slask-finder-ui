import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { hasPropertiesDefined } from "@utils/service-utils";
import { KeyFacetSelector } from "./KeyFacetSelector";
import { FloatFacetSelector } from "./NumericFacetSelectors";
import {
  Facet,
  FilteringQuery,
  Facets,
  isNumberFacet,
  isKeyFacet,
} from "./slask-finder/slask-finder.types";

type FacetContext = {
  facets: Facet[];
  query: FacetSelection;
  setQuery: React.Dispatch<React.SetStateAction<FacetSelection>>;
  addFilter: (id: number, value: SingleFacetValue) => void;
  removeFilter: (id: number, value?: SingleFacetValue) => void;
};

const FacetSelectionContext = createContext<FacetContext | null>(null);

export const useFacetSelection = () => {
  const context = useContext(FacetSelectionContext);
  if (context == null) {
    throw new Error("useFacetSelection must be used within a FacetList");
  }
  return context;
};
export type NumberValue = { min: number; max: number };
export type FacetValue = string | string[] | NumberValue;
export type SingleFacetValue = string | NumberValue;

export const isNumberValue = (value: unknown): value is NumberValue => {
  if (typeof value === "object" && value != null) {
    return typeof (value as NumberValue).min === "number";
  }
  return false;
};

export const isSelectedValue = (
  currentSelection: FacetValue | undefined,
  value: SingleFacetValue | undefined,
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
    // eslint-disable-next-line no-debugger
    debugger;
    return false;
  }
  // console.log("isSelected?", { currentSelection, value });
  if (Array.isArray(currentSelection)) {
    return currentSelection.includes(value);
  }

  return currentSelection == value;
};
// const isNumberSelection = (data: {
//   id: number;
//   value: FacetValue;
// }): data is {
//   id: number;
//   value: NumberValue;
// } => {
//   return isNumberValue(data.value);
// };
// const isStringSelection = (data: {
//   id: number;
//   value: FacetValue;
// }): data is { id: number; value: string | string[] } => {
//   return typeof data.value === "string" || Array.isArray(data.value);
// };

type FacetSelection = Pick<FilteringQuery, "range" | "string">;

const facetsToQuery = (facets: Facets): FacetSelection => {
  const result = facets.reduce<FacetSelection>(
    (acc, facet) => {
      if (facet.selected == null) {
        return acc;
      }
      if (isNumberFacet(facet)) {
        acc.range?.push({
          id: facet.id,
          min: facet.selected.min,
          max: facet.selected.max,
        });
      } else if (isKeyFacet(facet)) {
        acc.string?.push({ id: facet.id, value: facet.selected });
      }
      return acc;
    },
    { range: [], string: [] },
  );
  //console.log("Facets to query",result)
  return result;
};

type FacetType = "string" | "range";

const isStringValue = (value: unknown): value is string | string[] => {
  return typeof value === "string" || Array.isArray(value);
};

const isArrayValue = (value: string | string[]): value is string[] => {
  return Array.isArray(value);
};

type FacetProviderProps = {
  facets: Facet[];
  onFilterChanged: (data: FacetSelection) => void;
};

export const FacetProvider = ({
  facets,
  children,
  onFilterChanged,
}: PropsWithChildren<FacetProviderProps>) => {
  const [query, setQuery] = useState<FacetSelection>(facetsToQuery(facets));

  const addFilter = useCallback(
    (id: number, value: SingleFacetValue) => {
      const facet = facets.find((f) => f.id === id);

      if (facet == null) {
        return;
      }
      const type: FacetType = isNumberFacet(facet) ? "range" : "string";
      setQuery((prev) => {
        if (type === "range" && isNumberValue(value)) {
          prev.range = [
            ...(prev.range?.filter((r) => r.id !== id) ?? []),
            { id, ...value },
          ];
          onFilterChanged(prev);
          return { ...prev };
        }
        if (type === "string" && isStringValue(value)) {
          const existing = prev.string?.find((r) => r.id === id);
          if (existing == null) {
            prev.string = [
              ...(prev.string?.filter((r) => r.id !== id) ?? []),
              { id, value },
            ];
            onFilterChanged(prev);
            return { ...prev };
          }
          if (typeof existing.value === "string" && typeof value === "string") {
            existing.value = [existing.value, value];
          } else if (
            Array.isArray(existing.value) &&
            typeof value === "string"
          ) {
            existing.value = [
              ...existing.value.filter((d) => d != value),
              value,
            ];
          }
          onFilterChanged(prev);
        }
        return { ...prev };
      });
    },
    [facets, onFilterChanged],
  );
  const removeFilter = useCallback(
    (id: number, value?: SingleFacetValue) => {
      const facet = facets.find((f) => f.id === id);
      if (facet == null) {
        return;
      }
      const type: FacetType = isNumberFacet(facet) ? "range" : "string";
      setQuery((prev) => {
        if (value == null) {
          if (type === "range") {
            prev.range = prev.range?.filter((r) => r.id !== id);
          } else if (type === "string") {
            prev.string = prev.string?.filter((r) => r.id !== id);
          }
          onFilterChanged(prev);
          return { ...prev };
        }
        if (type === "string") {
          const existing = prev.string?.find((r) => r.id === id);
          if (existing == null) {
            return prev;
          }
          if (isArrayValue(existing.value)) {
            prev.string = prev.string?.map((r) => {
              if (r.id === id && isArrayValue(r.value)) {
                r.value = r.value.filter((v) => v != value);
              }
              return r;
            });
            onFilterChanged(prev);
          } else if (existing.value === value) {
            prev.string = prev.string?.filter((r) => r.id !== id);
            onFilterChanged(prev);
          }
        } else if (type === "range") {
          prev.range = prev.range?.filter((r) => r.id !== id);
          onFilterChanged(prev);
        }
        return { ...prev };
      });
    },
    [facets, onFilterChanged],
  );

  useEffect(() => {
    const selectedFacets = facets.filter((d) => d.selected != null);
    //console.log("facets changed", selectedFacets);
    const string = selectedFacets
      .filter(isKeyFacet)
      .filter(hasPropertiesDefined("selected"))
      .map((f) => ({
        id: f.id,
        value: f.selected,
      }));
    const range = selectedFacets.filter(isNumberFacet).map((f) => ({
      id: f.id,
      min: f.selected!.min,
      max: f.selected!.max,
    }));
    setQuery(({ string: _, range: __, ...other }) => ({
      ...other,
      string,
      range,
    }));
  }, [facets]);

  const ctx = useMemo(
    () => ({ facets, query, setQuery, addFilter, removeFilter }),
    [facets, query, setQuery, addFilter, removeFilter],
  );
  return (
    <FacetSelectionContext.Provider value={ctx}>
      {children}
    </FacetSelectionContext.Provider>
  );
};

export const FilteredFacetList = ({
  facetsToShow,
}: {
  facetsToShow: number[];
}) => {
  const { facets } = useFacetSelection();
  return (
    <>
      {facets.map((facet, i) => {
        if (facetsToShow.includes(facet.id)) {
          return (
            <FacetComponent key={facet.id} facet={facet} defaultOpen={i < 3} />
          );
        }
        return null;
      })}
    </>
  );
};

const FacetComponent = ({
  facet,
  defaultOpen,
}: {
  facet: Facet;
  defaultOpen: boolean;
}) => {
  // if (facet.type === "color") {
  //   return (
  //     <ColorFacetSelector {...facet} key={`fld-${facet.id}-${facet.name}`} />
  //   );
  // }
  if (isNumberFacet(facet)) {
    return (
      <FloatFacetSelector {...facet} key={`fld-${facet.id}-${facet.name}`} />
    );
  }
  if (isKeyFacet(facet)) {
    return (
      <KeyFacetSelector
        {...facet}
        key={`fld-${facet.id}-${facet.name}`}
        defaultOpen={defaultOpen}
      />
    );
  }
};

export const FacetList = ({ facetsToHide }: FacetListProps) => {
  const { facets } = useFacetSelection();
  return (
    <>
      {facets.map((facet, i) => {
        if (facetsToHide != null && facetsToHide.includes(facet.id)) {
          return null;
        }
        return (
          <FacetComponent key={facet.id} facet={facet} defaultOpen={i < 3} />
        );
      })}
    </>
  );
};

export type FacetListProps = {
  facetsToHide?: number[];
};

// export const FacetList = ({
//   facets,
//   facetsToHide,
//   onFilterChanged,
// }: FacetProviderProps & FacetListProps) => {
//   return (
//     <FacetProvider
//       facets={facets}
//       onFilterChanged={onFilterChanged}
//     >
//       <Facets
//     </FacetProvider>
//   );
// };

export const useFacetSelectors = (id: number) => {
  const { facets, addFilter, removeFilter, query } = useFacetSelection();
  const currentFacet = useMemo(
    () => facets.find((f) => f.id === id),
    [id, facets],
  );
  const selected = useMemo(() => {
    if (currentFacet == null) {
      return undefined;
    }
    if (isNumberFacet(currentFacet)) {
      return query.range?.find((r) => r.id === id);
    }
    return query.string?.find((r) => r.id === id)?.value;
  }, [currentFacet, query, id]);

  return {
    addFilter: (value: SingleFacetValue) => addFilter(id, value),
    removeFilter: (value?: SingleFacetValue) => removeFilter(id, value),
    selected,
  };
};
