import { use, useEffect, useMemo, useState } from "react";
import { isNumberFacet, KeyFacet } from "../lib/types";
import { ChevronUp, LoaderCircle, X } from "lucide-react";

import { stores } from "../lib/datalayer/stores";
import { useQuery } from "../lib/hooks/useQuery";
import { KeyFacetSelector } from "./facets/KeyFacetSelector";
import { ColorFacetSelector } from "./facets/ColorFacet";
import { NumberFacetSelector } from "./facets/NumericFacetSelectors";
import { cm } from "../utils";
import { useScreenWidth } from "../lib/hooks/useScreenWidth";
import { useTranslations } from "../lib/hooks/useTranslations";
import { useFacets } from "../lib/hooks/useFacets";
import { StarRatingFacetSelector } from "./facets/RatingFacet";
import { calculateDistance } from "./map-utils";

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
    <div className="mb-4 pb-2">
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
  hideFacetsWithSingleValue?: boolean;
};
export const FacetList = ({
  facetsToHide,
  facetsToDisable = [],
  hideFacetsWithSingleValue = false,
}: FacetListProps) => {
  const { facets } = useFacets();
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
          if (facet.valueType === "rating") {
            return (
              <StarRatingFacetSelector
                {...facet}
                defaultOpen={!facet.disabled && facet.selected != null}
                key={`fld-${facet.id}-${facet.name}`}
              />
            );
          }
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
        if (hideFacetsWithSingleValue && facet.result.values.length <= 1) {
          return null;
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
  hideFacetsWithSingleValue = false,
  hideCategories = false,
}: FacetListProps & {
  hideCategories?: boolean;
  hideFacetsWithSingleValue?: boolean;
}) => {
  const { facets, categoryFacets, isLoadingFacets: isLoading } = useFacets();
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const isDesktop = useScreenWidth(768);

  if (isLoading && facets.length === 0) {
    return (
      <aside className="animate-pulse">
        <h2 className="text-lg font-semibold my-4">{t("facets.title")}</h2>
        <div className="my-10 flex items-center justify-center">
          <LoaderCircle className="size-10 animate-spin" />
        </div>
      </aside>
    );
  }

  return (
    <aside>
      <button
        className="md:text-lg w-full flex justify-between items-center font-semibold my-2 md:mt-0"
        onClick={() => setOpen((p) => !p)}
      >
        <span>
          {t("facets.title")}{" "}
          {facets.length > 0 && (
            <span className="text-gray-500">({facets.length})</span>
          )}
        </span>
        <ChevronUp
          className={cm(
            "size-5 transition-transform md:hidden",
            open ? "rotate-0" : "rotate-180"
          )}
        />
      </button>
      {(isDesktop || open) && (
        <div className="animate-facets mt-4 md:mt-0">
          {!hideCategories && <CategoryResult categories={categoryFacets} />}
          <div>
            <FacetList
              facetsToHide={facetsToHide}
              hideFacetsWithSingleValue={hideFacetsWithSingleValue}
              facetsToDisable={facetsToDisable}
            />
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2">{t("facets.stock")}</h3>
            <StoreSelector />
          </div>
          <button
            className={cm(
              "sticky w-full transition-all bottom-2 left-2 z-10 right-2 p-1 bg-blue-100 border rounded-lg border-blue-300 md:hidden animate-pop"
            )}
            onClick={(e) => {
              requestAnimationFrame(() => {
                globalThis.document.querySelector("#results")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                  inline: "nearest",
                });
                e.preventDefault();
                e.stopPropagation();
              });
            }}
          >
            {t("facets.gotoResults")}
          </button>
        </div>
      )}
    </aside>
  );
};

const StoreSelector = () => {
  const {
    query: { stock = [] },
    setStock,
  } = useQuery();
  const t = useTranslations();
  const [maxDistance, setMaxDistance] = useState(10);
  const sortedStores = useMemo(() => {
    return Object.values(stores)
      .map(({ displayName, id }) => ({
        displayName: displayName.replace("Elgiganten ", ""),
        id,
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, []);

  const findCloseStores = (selected: string[]) => {
    const closeBy = new Set<string>(selected);
    selected.forEach((storeId) => {
      const targetStore = stores.find((d) => d.id === storeId);
      if (!targetStore) return;
      const { lat, lng } = targetStore.address.location;
      const closeStores = stores
        .map((store) => {
          return {
            ...store,
            distance: calculateDistance(
              {
                coords: {
                  latitude: lat,
                  longitude: lng,
                },
              },
              store.address.location
            ),
          };
        })
        .filter((store) => {
          return store.distance <= maxDistance;
        })
        .forEach((store) => {
          closeBy.add(store.id);
        });

      console.log("closeStores", closeStores);
    });
    setStock(Array.from(closeBy));
  };

  // useEffect(() => {
  //   findCloseStores(stock);
  // }, [maxDistance, stock]);

  return (
    <>
      <div className="flex gap-2">
        <input
          type="range"
          min="5"
          max="250"
          value={maxDistance}
          onChange={(e) => setMaxDistance(Number(e.target.value))}
          onMouseUp={() => findCloseStores([stock[0]])}
        />
        <span>{maxDistance} km</span>
      </div>
      <select
        value={stock[0] ?? ""}
        onChange={(e) => {
          const { value } = e.target;
          if (value === "") {
            setStock([]);
          } else {
            findCloseStores([value]);
          }
        }}
        className="w-full p-2 border border-gray-300 bg-white rounded-md"
      >
        <option value="">{t("facets.stockEmptySelection")}</option>
        {sortedStores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.displayName}
          </option>
        ))}
      </select>
      <div className="bg-gray-50 p-2 my-2 rounded-md">
        {stock.map((storeId) => {
          const store = stores.find((d) => d.id === storeId);
          if (!store) return null;
          return (
            <div key={storeId} className="flex items-center gap-2 ">
              <span className="flex-1 shrink-0">{store.displayName}</span>
              <button
                onClick={() => {
                  setStock(stock.filter((d) => d !== storeId));
                }}
                className="text-red-500"
              >
                <X />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};
