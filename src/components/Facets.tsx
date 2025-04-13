import { useMemo } from "react";
import { Facet, isKeyFacet, isNumberFacet, KeyFacet } from "../lib/types";
import { LoaderCircle } from "lucide-react";

import { stores } from "../lib/datalayer/stores";
import { useQuery } from "../lib/hooks/QueryProvider";
import { KeyFacetSelector } from "./facets/KeyFacetSelector";
import { ColorFacetSelector } from "./facets/ColorFacet";
import { NumberFacetSelector } from "./facets/NumericFacetSelectors";
import { cm } from "../utils";

const CategoryLevel = ({
  id,
  facets,
  index,
}: {
  id: number;
  facets: KeyFacet[];
  index: number;
}) => {
  const { setQuery } = useQuery();
  const facet = facets[index];
  if (!facet) {
    return null;
  }
  return (
    <ul className="pl-3">
      {Object.entries(facet.result.values).map(([value, results], idx, all) => {
        const selected = facet.selected?.includes(value);
        return (
          <li key={idx}>
            <button
              className={cm("text-left", selected ? "font-bold" : undefined)}
              onClick={() => {
                setQuery((prev) => ({
                  ...prev,
                  string: [
                    ...(prev.string?.filter(
                      (d) => !facets.some((e) => e.id == d.id)
                    ) ?? []),
                    { id, value: selected ? [] : [value] },
                  ],
                }));
                //updateValue(selected ? [] : [value]);
              }}
            >
              {value} ({results})
            </button>
            {facets[index + 1]?.id != null &&
              (selected || all.length === 1) && (
                <CategoryLevel
                  facets={facets}
                  index={index + 1}
                  id={facets[index + 1].id}
                />
              )}
          </li>
        );
      })}
    </ul>
  );
};

const CategoryResult = ({ categories }: { categories: KeyFacet[] }) => {
  const sorted = useMemo(
    () =>
      categories.sort((a, b) => {
        return (a.categoryLevel ?? 0) - (b.categoryLevel ?? 0);
      }),
    [categories]
  );
  // console.log("sorted", sorted);
  if (sorted.length === 0 || sorted[0].categoryLevel !== 1) {
    return null;
  }
  return (
    <div className="mb-4 border-b border-gray-100 pb-2">
      <div className="font-medium bold mb-2 flex items-center justify-between w-full text-left">
        <span>{sorted[0].name}</span>
      </div>
      <CategoryLevel facets={sorted} index={0} id={sorted[0].id} />
    </div>
  );
};

export const Facets = ({ facetsToHide }: { facetsToHide?: number[] }) => {
  const { facets: results, isLoadingFacets: isLoading } = useQuery();

  const [cat, allFacets] = useMemo(
    () =>
      (results ?? [])
        .filter((d) => facetsToHide == null || !facetsToHide.includes(d.id))
        .reduce(
          ([c, all], facet) => {
            if (
              facet.categoryLevel != null &&
              facet.categoryLevel > 0 &&
              isKeyFacet(facet)
            ) {
              return [[...c, facet], all];
            }
            return [c, [...all, facet]];
          },
          [[] as KeyFacet[], [] as Facet[]]
        ),
    [results, facetsToHide]
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
      <aside className="w-full md:w-72 border-b-2 border-gray-200 md:border-none">
        <h2 className="text-lg font-semibold mb-4">Filter</h2>
        <CategoryResult categories={cat} />
        <div>
          {allFacets.map((facet) => {
            if (isNumberFacet(facet)) {
              return (
                <NumberFacetSelector
                  {...facet}
                  defaultOpen={facet.selected != null}
                  key={`fld-${facet.id}-${facet.name}`}
                />
              );
            }
            if (facet.valueType === "color") {
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
                defaultOpen={facet.selected != null}
              />
            );
          })}
        </div>

        <div className="mb-4">
          <h3 className="font-medium mb-2">Select Store</h3>
          <StoreSelector />
        </div>
      </aside>
    )
  );
};

const StoreSelector = () => {
  const {
    query: { stock = [] },
    setStock,
  } = useQuery();
  const sortedStores = useMemo(() => {
    return Object.values(stores)
      .map(({ displayName, id }) => ({
        displayName: displayName.replace("Elgiganten ", ""),
        id,
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, []);
  return (
    <select
      value={stock?.[0] ?? ""}
      onChange={(e) => setStock(e.target.value === "" ? [] : [e.target.value])}
      className="w-full p-2 border border-gray-300 rounded-md"
    >
      <option value="">Ingen butik</option>
      {sortedStores.map((store) => (
        <option key={store.id} value={store.id}>
          {store.displayName.replace("Elgiganten ", "")}
        </option>
      ))}
    </select>
  );
};
