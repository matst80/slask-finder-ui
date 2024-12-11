import { useMemo } from "react";

import { isKeyFacet, isNumberFacet } from "../../types";
import { LoaderCircle } from "lucide-react";
import { stores } from "../../datalayer/stores";
import { useHashFacets, useQueryHelpers } from "../../hooks/searchHooks";
import { byPriority } from "../../utils";

import { ColorFacetSelector } from "./ColorFacet";
import {
  FloatFacetSelector,
  IntegerFacetSelector,
} from "./NumericFacetSelectors";
import { KeyFacetSelector } from "./KeyFacetSelector";

export const Facets = () => {
  const { data: results, isLoading } = useHashFacets();
  const {
    query: { stock },
    setStock,
  } = useQueryHelpers();

  const allFacets = useMemo(
    () => (results ?? []).sort(byPriority),
    [results],
  );
  const hasFacets = allFacets.length > 0;
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
      <aside className="w-full md:w-72">
        <h2 className="text-lg font-semibold mb-4">Filter</h2>
        <div>
          {allFacets.map((facet, i) => {
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
      </aside>
    )
  );
};
