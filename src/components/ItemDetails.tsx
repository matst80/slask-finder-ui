import { ShoppingCart } from "lucide-react";
import {
  useCompatibleItems,
  useFacetMap,
  useRelatedItems,
  useRelationGroups,
} from "../hooks/searchHooks";
import { useEffect, useMemo, useState } from "react";
import { byPriority, cm, isDefined, makeImageUrl } from "../utils";
import {
  ItemDetail,
  ItemsQuery,
  ItemValues,
  KeyField,
  NumberField,
  RelationGroup,
  relationValueConverters,
} from "../lib/types";
import { Store, stores } from "../lib/datalayer/stores";
import { ResultItem } from "./ResultItem";
import { useAddToCart } from "../hooks/cartHooks";
import { Price, PriceValue } from "./Price";
import { QueryProvider } from "../lib/hooks/QueryProvider";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useAdmin } from "../hooks/appState";
import { getAdminItem } from "../lib/datalayer/api";
import { useQuery } from "../lib/hooks/useQuery";

const ignoreFaceIds = [3, 4, 5, 10, 11, 12, 13];

const useGeoLocation = () => {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position),
        (error) => console.error("Error getting location:", error)
      );
    }
  }, []);

  return location;
};

const calculateDistance = (
  you: GeolocationPosition,
  other: {
    lat: number;
    lng: number;
  }
) => {
  const R = 6371e3; // metres
  const φ1 = (you.coords.latitude * Math.PI) / 180; // φ, λ in radians
  const φ2 = (other.lat * Math.PI) / 180;
  const Δφ = ((other.lat - you.coords.latitude) * Math.PI) / 180;
  const Δλ = ((other.lng - you.coords.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d / 1000;
};

const StockLocation = ({ stock, distance, ...store }: StoreWithStock) => {
  return (
    <li
      key={store.id}
      className="flex items-center py-2 px-3 hover:bg-gray-50 gap-2"
    >
      <div className="flex items-center gap-2 flex-grow">
        <span className="font-medium line-clamp-1 text-ellipsis">{store.name}</span>
        <span className="text-gray-500">•</span>
        <span className="text-green-600 font-medium">{stock} st</span>
      </div>
      {distance != null && (
        <span className="text-gray-500 text-sm">{distance.toFixed(0)} km</span>
      )}
    </li>
  );
};

type StoreWithStock = Store & {
  stock: string;
  distance: number | null;
};

const StockList = ({
  stock,
  stockLevel,
}: Pick<ItemDetail, "stock" | "stockLevel">) => {
  const location = useGeoLocation();
  const storesWithStock = useMemo(() => {
    return Object.entries(stock ?? {})
      .map(([id, value]) => {
        const store = stores.find((store) => store.id === id);
        if (!store) return null;
        return {
          ...store,
          stock: value,
          distance:
            location != null
              ? calculateDistance(location, store.address.location)
              : null,
        };
      })
      .filter(isDefined)
      .sort((a, b) =>
        location != null
          ? a.distance! - b.distance!
          : a.displayName.localeCompare(b.displayName)
      );
  }, [stock, location]);
  if (stock == null) return null;
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
        <h3 className="text-lg font-semibold">Lagerstatus</h3>
        {stockLevel != null && stockLevel !== "0" && (
          <p className="text-gray-600 mt-1">I lager online: {stockLevel} st</p>
        )}
      </div>

      <div className="overflow-y-auto max-h-48">
        <ul className="border-t border-gray-200 divide-y divide-gray-200">
          {storesWithStock.map((s) => (
            <StockLocation key={s.id} {...s} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export const RelatedItems = ({ id }: Pick<ItemDetail, "id">) => {
  const { data, isLoading } = useRelatedItems(id);

  return (
    <div className="max-w-full overflow-y-auto snap-y">
      <div className="flex w-fit">
        {isLoading && <p>Laddar...</p>}
        {data?.map((item, idx) => (
          <div
            key={item.id}
            className="flex-shrink-0 w-[250px] flex snap-start"
          >
            <ResultItem {...item} position={idx} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ResultCarousel = () => {
  const { hits, isLoading } = useQuery();

  return (
    <div className="max-w-full overflow-y-auto snap-y">
      <div className="flex w-fit">
        {isLoading && <p>Laddar...</p>}
        {hits?.map((item, idx) => (
          <div
            key={item.id}
            className="flex-shrink-0 w-[300px] flex snap-start"
          >
            <ResultItem {...item} position={idx} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CompatibleItems = ({ id }: Pick<ItemDetail, "id">) => {
  const { data, isLoading } = useCompatibleItems(id);

  return (
    <div className="max-w-full overflow-y-auto snap-y">
      <div className="flex w-fit">
        {isLoading && <p>Laddar...</p>}
        {data?.map((item, idx) => (
          <div
            key={item.id}
            className="flex-shrink-0 w-[250px] flex snap-start"
          >
            <ResultItem {...item} position={idx} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CompatibleButton = ({ values }: Pick<ItemDetail, "values">) => {
  const { setQuery } = useQuery();
  const { data } = useFacetMap();
  const stringFilters = useMemo(() => {
    const filter = Object.entries(values)
      .map(([id]) => {
        const facet = data?.[id];
        if (!facet || facet.linkedId == null) {
          return null;
        }
        if (facet.linkedId == 31158) {
          return null;
        }
        const value = values[id];
        if (value == null) {
          return null;
        }
        return {
          id: facet.linkedId!,
          value: Array.isArray(value) ? value : [String(value)],
        };
      })
      .filter(isDefined);

    return filter;
  }, [values, data]);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuery({
      page: 0,
      string: stringFilters,
      range: [],
    });
  };
  if (stringFilters.length === 0) return null;
  return (
    <Button size="sm" onClick={handleClick}>
      Visa kompatibla ({stringFilters.map((f) => f.id).join(", ")})
    </Button>
  );
};

const Properties = ({ values }: Pick<ItemDetail, "values">) => {
  const { setQuery } = useQuery();
  const { data } = useFacetMap();
  const [isAdmin] = useAdmin();
  const fields = useMemo(() => {
    return Object.entries(values)
      .map(([id, value]) => {
        const facet = data?.[id];
        if (!facet || ignoreFaceIds.includes(facet.id)) {
          return null;
        }
        if (!isAdmin && facet.hide) {
          return null;
        }
        return {
          ...facet,
          value,
        };
      })
      .filter(isDefined)
      .sort(byPriority);
  }, [values, data, isAdmin]);
  return (
    <div className="md:bg-white md:rounded-lg md:shadow-sm md:border border-gray-100 md:p-4">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        Egenskaper
        <span className="ml-2 text-gray-500 text-lg">({fields.length})</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
        {fields.map((field) => (
          <div
            key={`prop-${field.id}-${field.valueType}`}
            className="py-2 md:p-3 md:rounded-lg md:hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <h4
                className="text-lg font-semibold text-gray-900"
                onClick={() => {
                  navigator.clipboard.writeText(String(field.id));
                }}
              >
                {field.name}
              </h4>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-gray-700">
                {Array.isArray(field.value)
                  ? field.value.join(", ")
                  : String(field.value)}
              </p>
              {field.linkedId != null &&
                isAdmin &&
                field.linkedId > 0 &&
                field.value != null && (
                  <Link
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
                    to="/"
                    onClick={() => {
                      if (field.linkedId != null && field.value != null) {
                        setQuery({
                          page: 0,
                          string: [
                            {
                              id: field.linkedId,
                              value: Array.isArray(field.value)
                                ? field.value
                                : [String(field.value)],
                            },
                          ],
                        });
                      }
                    }}
                  >
                    Visa kompatibla
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {field.linkedId}
                    </span>
                  </Link>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

type PossibleValue = string | string[] | number | undefined;

const hasRequiredValue = (
  requiredValue: PossibleValue,
  value: PossibleValue
) => {
  if (value == null) return false;
  if (requiredValue == null) return value != null;

  if (Array.isArray(requiredValue)) {
    return requiredValue.some((part) =>
      Array.isArray(value)
        ? value.includes(part)
        : String(part) === String(value)
    );
  }
  return String(requiredValue) === String(value);
};

const isRangeFilter = (d: NumberField | KeyField): d is NumberField => {
  if ("value" in d) {
    return false;
  }
  if ("min" in d) {
    return true;
  }
  return true;
};

const makeQuery = (
  group: RelationGroup,
  values: ItemDetail["values"]
): ItemsQuery => {
  const globalFilters =
    group.additionalQueries?.map((query) => {
      return {
        id: query.facetId,
        value: Array.isArray(query.value)
          ? (query.value as string[])
          : [String(query.value)],
      };
    }) ?? [];
  const filters = group.relations.map((relation) => {
    const fromValue = values[relation.fromId];
    const converter =
      relationValueConverters[relation.converter] ??
      relationValueConverters.none;
    if (fromValue == null) return null;
    const filterValue = converter(fromValue);
    if (filterValue == null) return null;

    return {
      id: relation.toId,
      ...filterValue,
    };
  });
  const allFilters = [...globalFilters, ...filters.filter(isDefined)];
  const [string, range] = allFilters.reduce(
    (acc, filter) => {
      if (isRangeFilter(filter)) {
        acc[1]!.push(filter);
      } else {
        acc[0]!.push(filter);
      }
      return acc;
    },
    [[], []] as [ItemsQuery["string"], ItemsQuery["range"]]
  );

  return {
    page: 0,
    string,
    range,
  };
};

const RelationGroupCarousel = ({
  group,
  values,
  defaultOpen = false,
}: {
  group: RelationGroup;
  values: ItemValues;
  defaultOpen?: boolean;
}) => {
  const query = useMemo(() => makeQuery(group, values), [group, values]);
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div key={group.groupId} className="mb-2 border-b border-gray-200 pb-2">
      <button
        onClick={() => setOpen((p) => !p)}
        className={cm("text-xl font-bold transition-all", open ? "" : "")}
      >
        {group.name}
      </button>

      {open && (
        <QueryProvider initialQuery={query} loadFacets={false}>
          {/* <QueryMerger query={query} /> */}
          <ResultCarousel />
        </QueryProvider>
      )}
    </div>
  );
};

const RelationGroups = ({ values }: Pick<ItemDetail, "values">) => {
  const { data } = useRelationGroups();
  const validGroups = useMemo(() => {
    return (
      data?.filter((group) =>
        group.requiredForItem.every((requirement) =>
          hasRequiredValue(requirement.value, values[requirement.facetId])
        )
      ) ?? []
    );
  }, [values, data]);
  return (
    <div>
      {validGroups.map((group, idx) => {
        return (
          <RelationGroupCarousel
            key={group.key}
            group={group}
            values={values}
            defaultOpen={idx === 0}
          />
        );
      })}
    </div>
  );
};

const PopulateAdminDetails = ({ id }: { id: number }) => {
  const [isAdmin] = useAdmin();
  const [item, setItem] = useState<ItemDetail | null>(null);
  if (!isAdmin) return null;
  if (item != null) {
    const mp = Math.max(item.mp ?? 0, 0);
    const possibleDiscount = item.values[4] * (mp / 100);
    return (
      <div className="bg-orange-300 p-4 mt-2 rounded-lg flex gap-2 items-center justify-between">
        <PriceValue
          value={item.values[4] - possibleDiscount}
          className="font-bold"
        />
        <span>({mp}%)</span>
      </div>
    );
  }
  return (
    <Button
      size="sm"
      variant="outline"
      className="mt-2"
      onClick={() => getAdminItem(id).then(setItem)}
    >
      Fetch details
    </Button>
  );
};

const CartAnimation = ({
  isVisible,
  onComplete,
}: {
  isVisible: boolean;
  onComplete: () => void;
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="animate-[cartAdd_1s_ease-out]">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg">
            <ShoppingCart className="w-6 h-6" />
            <span className="font-medium">Tillagd i kundvagnen!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ItemDetails = (details: ItemDetail) => {
  const { trigger: addToCart, isMutating } = useAddToCart(details.id);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleAddToCart = async () => {
    await addToCart({ sku: details.sku, quantity: 1 });
    setShowAnimation(true);
  };

  if (!details) return null;
  const {
    title,
    img,
    bp,
    stockLevel,
    stock,
    buyable,
    buyableInStore,
    id,
    values,
    disclaimer,
  } = details;
  return (
    <>
      <CartAnimation
        isVisible={showAnimation}
        onComplete={() => setShowAnimation(false)}
      />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-12">
          {/* Image Section */}
          <div className="flex items-center justify-center">
            <img
              className="max-w-full h-auto object-contain"
              src={makeImageUrl(img)}
              alt={title}
            />
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{title}</h2>
              {bp && (
                <ul className="space-y-3 text-gray-600">
                  {bp.split("\n").map((txt) => (
                    <li key={txt} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {txt}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Price and Cart Section */}
            {(buyable || buyableInStore) && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 text-sm">Pris</span>
                    <div className="text-4xl font-bold text-gray-900">
                      <Price values={values} disclaimer={disclaimer} />
                    </div>
                  </div>
                  <button
                    className={cm(
                      "bg-blue-600 text-white px-4 py-2 text-center rounded-lg transition-all hover:bg-blue-700 items-center gap-3 text-lg",
                      isMutating ? "animate-pulse" : ""
                    )}
                    onClick={handleAddToCart}
                  >
                    
                    Lägg i kundvagn
                  </button>
                </div>

                <StockList stock={stock} stockLevel={stockLevel} />
                <PopulateAdminDetails id={id} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="mt-16 space-y-16">
          <RelationGroups values={values} />

          <div>
            <Properties values={details.values} />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-6 mb-8">
              Liknande produkter
            </h3>
            <RelatedItems id={details.id} />
          </div>
        </div>
      </div>
    </>
  );
};
