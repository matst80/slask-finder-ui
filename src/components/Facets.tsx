import { useMemo, useState } from "react";
import { isNumberFacet, KeyFacet } from "../lib/types";
import { ChevronUp, LoaderCircle, X, Store } from "lucide-react";
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
import { useStores } from "../lib/datalayer/stores";

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
                      (d) => !facets.some((e) => e.id == d.id),
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
    [categories],
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

    [facets, facetsToHide, facetsToDisable],
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
            open ? "rotate-0" : "rotate-180",
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
              "sticky w-full transition-all bottom-2 left-2 z-10 right-2 p-1 bg-blue-100 border rounded-lg border-blue-300 md:hidden animate-pop",
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
  const { data: stores } = useStores();
  const [maxDistance, setMaxDistance] = useState(30);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const sortedStores = useMemo(() => {
    return Object.values(stores ?? {})
      .map(({ displayName, id }) => ({
        displayName: displayName
          .replace("Elgiganten ", "")
          .replace("Elkjøp ", ""),
        id,
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [stores]);

  const findCloseStores = (selected: string[]) => {
    const closeBy = new Set<string>(selected);
    selected.forEach((storeId) => {
      const targetStore = stores?.find((d) => d.id === storeId);
      if (!targetStore) return;
      const { lat, lng } = targetStore.address.location;
      stores
        ?.map((store) => {
          return {
            ...store,
            distance: calculateDistance(
              {
                coords: {
                  latitude: lat,
                  longitude: lng,
                },
              },
              store.address.location,
            ),
          };
        })
        .filter((store) => {
          return store.distance <= maxDistance;
        })
        .forEach((store) => {
          closeBy.add(store.id);
        });
    });
    setStock(Array.from(closeBy));
  };

  return (
    <div className="space-y-4">
      {/* Distance Range Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Max distance</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {maxDistance} km
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="5"
            max="250"
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            onMouseUp={() => findCloseStores([stock[0]])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                ((maxDistance - 5) / (250 - 5)) * 100
              }%, #e5e7eb ${
                ((maxDistance - 5) / (250 - 5)) * 100
              }%, #e5e7eb 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 km</span>
            <span>250 km</span>
          </div>
        </div>
      </div>

      {/* Store Selector */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Store className="size-4 text-gray-500" />
          Select store
        </label>
        <div className="relative">
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
            onFocus={() => setIsSelectOpen(true)}
            onBlur={() => setIsSelectOpen(false)}
            className={cm(
              "w-full px-4 py-3 pr-10 border border-gray-300 bg-white rounded-lg",
              "appearance-none cursor-pointer transition-all duration-200",
              "hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
              "text-gray-900 placeholder-gray-500",
              isSelectOpen && "border-blue-500 ring-2 ring-blue-200",
            )}
          >
            <option value="" className="text-gray-500">
              {t("facets.stockEmptySelection")}
            </option>
            {sortedStores.map((store) => (
              <option key={store.id} value={store.id} className="text-gray-900">
                {store.displayName}
              </option>
            ))}
          </select>
          <ChevronUp
            className={cm(
              "absolute right-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400 transition-transform duration-200 pointer-events-none",
              isSelectOpen ? "rotate-0" : "rotate-180",
            )}
          />
        </div>
      </div>

      {/* Selected Stores */}
      {stock.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Selected stores ({stock.length})
            </span>
            {stock.length > 1 && (
              <button
                onClick={() => setStock([])}
                className="text-xs text-red-600 hover:text-red-800 transition-colors duration-200"
              >
                {t("common.clear")}
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-screen overflow-y-auto">
            {stock.map((storeId) => {
              const store = stores?.find((d) => d.id === storeId);
              if (!store) return null;
              return (
                <div
                  key={storeId}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900 flex-1">
                      {store.displayName}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setStock(stock.filter((d) => d !== storeId));
                    }}
                    className={cm(
                      "p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50",
                      "transition-all duration-200 opacity-70 group-hover:opacity-100",
                    )}
                    title={t("common.remove")}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
