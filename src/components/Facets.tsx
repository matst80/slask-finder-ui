import { useMemo } from "react";
import { isNumberFacet } from "../lib/types";
import { LoaderCircle } from "lucide-react";
import { byPriority } from "../utils";
import { stores } from "../lib/datalayer/stores";
import { useQuery } from "../lib/hooks/QueryProvider";
import { KeyFacetSelector } from "./facets/KeyFacetSelector";
import { ColorFacetSelector } from "./facets/ColorFacet";
import { NumberFacetSelector } from "./facets/NumericFacetSelectors";

export const Facets = ({ facetsToHide }: { facetsToHide?: number[] }) => {
  const {
    query: { stock },
    setStock,
    facets: results,
    isLoadingFacets: isLoading,
  } = useQuery();

  const allFacets = useMemo(() => results ?? [].sort(byPriority), [results]);
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
          {allFacets
            .filter((d) => facetsToHide == null || !facetsToHide.includes(d.id))
            .map((facet, i) => {
              if (isNumberFacet(facet)) {
                return (
                  <NumberFacetSelector
                    {...facet}
                    key={`fld-${facet.id}-${facet.name}`}
                  />
                );
              }
              if (facet.type === "color") {
                return (
                  <ColorFacetSelector
                    {...facet}
                    key={`fld-${facet.id}-${facet.name}`}
                  />
                );
              }
              return (
                <KeyFacetSelector
                  {...facet}
                  key={`fld-${facet.id}-${facet.name}`}
                  defaultOpen={i < 5}
                />
              );
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
