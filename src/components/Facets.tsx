import { useMemo, useState } from "react";
import { isNumberFacet, KeyFacet } from "../lib/types";
import { LoaderCircle } from "lucide-react";

import { stores } from "../lib/datalayer/stores";
import { useQuery } from "../lib/hooks/useQuery";
import { KeyFacetSelector } from "./facets/KeyFacetSelector";
import { ColorFacetSelector } from "./facets/ColorFacet";
import { NumberFacetSelector } from "./facets/NumericFacetSelectors";
import { cm } from "../utils";
import { useScreenWidth } from "../lib/hooks/useScreenWidth";

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
                  page: 0,
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

type FacetListProps = {
  facetsToHide?: number[];
  facetsToDisable?: number[];
};
export const FacetList = ({
  facetsToHide,
  facetsToDisable = [],
}: FacetListProps) => {
  const { facets } = useQuery();
  const allFacets = useMemo(
    () =>
      facets
        .filter((d) => facetsToHide == null || !facetsToHide.includes(d.id))
        .map((d) => ({ ...d, disabled: facetsToDisable.includes(d.id) })),

    [facets, facetsToHide, facetsToDisable]
  );
  return (
    <>
      {allFacets.map((facet) => {
        if (isNumberFacet(facet)) {
          return (
            <NumberFacetSelector
              {...facet}
              defaultOpen={!facet.disabled && facet.selected != null}
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
            defaultOpen={!facet.disabled && facet.selected != null}
          />
        );
      })}
    </>
  );
};

export const Facets = ({
  facetsToHide,
  facetsToDisable,
  hideCategories = false,
}: FacetListProps & {
  hideCategories?: boolean;
}) => {
  const { facets, categoryFacets, isLoadingFacets: isLoading } = useQuery();
  const [open, setOpen] = useState(false);
  const isDesktop = useScreenWidth(768);

  if (isLoading && facets.length === 0) {
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
    <aside className="w-full md:w-72 border-b-2 border-gray-200 md:border-none">
      <button
        className="text-lg font-semibold mb-2 md:mb-4"
        onClick={() => setOpen((p) => !p)}
      >
        Filter ({facets.length})
      </button>
      {(isDesktop || open) && (
        <>
          {!hideCategories && <CategoryResult categories={categoryFacets} />}
          <div>
            <FacetList
              facetsToHide={facetsToHide}
              facetsToDisable={facetsToDisable}
            />
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Select Store</h3>
            <StoreSelector />
          </div>
        </>
      )}
    </aside>
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
          {store.displayName}
        </option>
      ))}
    </select>
  );
};
