import {
  useCompatibleItems,
  useFacetMap,
  useRelatedItems,
  useRelationGroups,
} from "../hooks/searchHooks";
import { useMemo, useState } from "react";
import { cm, isDefined, makeImageUrl } from "../utils";
import {
  ItemDetail,
  ItemsQuery,
  ItemValues,
  KeyField,
  NumberField,
  RelationGroup,
  relationValueConverters,
} from "../lib/types";
import { Store } from "../lib/datalayer/stores";
import { ResultItem } from "./ResultItem";
import { useAddToCart } from "../hooks/cartHooks";
import { Price, PriceValue } from "./Price";
import { QueryProvider } from "../lib/hooks/QueryProvider";
import { Button } from "./ui/button";
import { useAdmin } from "../hooks/appState";
import { getAdminItem } from "../lib/datalayer/api";
import { useQuery } from "../lib/hooks/useQuery";
import { trackAction } from "../lib/datalayer/beacons";
import { Properties } from "./Properties";
import { StockList } from "./StockList";
import { Link } from "react-router-dom";
import { useTranslations } from "../lib/hooks/useTranslations";

export type StoreWithStock = Store & {
  stock: string;
  distance: number | null;
};

export const RelatedItems = ({ id }: Pick<ItemDetail, "id">) => {
  const { data, isLoading } = useRelatedItems(id);

  return (
    <div className="max-w-full overflow-y-auto snap-y">
      <div className="flex w-fit">
        {isLoading && <p>Laddar...</p>}
        {data?.map((item, idx) => (
          <div key={item.id} className="shrink-0 w-[250px] flex snap-start">
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
          <div key={item.id} className="shrink-0 w-[300px] flex snap-start">
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
          <div key={item.id} className="shrink-0 w-[250px] flex snap-start">
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
  const t = useTranslations();
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
      {t("common.show_compatible", {
        ids: stringFilters.map((f) => f.id).join(", "),
      })}
    </Button>
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
  const { setQuery } = useQuery();
  const query = useMemo(() => makeQuery(group, values), [group, values]);
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      key={group.groupId}
      className="mb-2 border-b border-gray-200 pb-2 animating-element"
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen((p) => !p)}
          className={cm("text-xl font-bold transition-all", open ? "" : "")}
        >
          {group.name}
        </button>
        <Link
          to="/"
          onClick={() => setQuery(query)}
          className={cm("text-xl font-bold transition-all", open ? "" : "")}
        >
          Show all
        </Link>
      </div>
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
      <div className="p-4 my-2 flex gap-2 items-center justify-between bg-amber-100 text-amber-800 rounded-lg">
        <PriceValue
          value={item.values[4] - possibleDiscount}
          className="font-bold"
        />
        {mp > 0 && <span>{mp}%</span>}
      </div>
    );
  }
  return (
    <Button
      size="sm"
      variant="outline"
      className="my-2"
      onClick={() => {
        trackAction({ action: "fetch_admin_details", reason: "admin_button" });
        getAdminItem(id).then(setItem);
      }}
    >
      Fetch details
    </Button>
  );
};

const BreadCrumbs = ({ values }: Pick<ItemDetail, "values">) => {
  const { setQuery } = useQuery();
  const parts = useMemo(() => {
    return [10, 11, 12, 13]
      .map((id) => ({ id, value: values[id] }))
      .filter(
        (d) =>
          d.value != null && typeof d.value === "string" && d.value.length > 0
      );
  }, [values]);
  return (
    <div className="inline-flex items-center overflow-x-auto max-w-full mb-4">
      {parts.map(({ id, value }, idx) => (
        <Link
          to="/"
          key={idx}
          onClick={() => {
            setQuery({
              page: 0,
              string: [
                {
                  id,
                  value: [String(value)],
                },
              ],
            });
          }}
          className="text-sm grow-0 shrink-0 text-gray-500 hover:text-blue-600 cursor-pointer"
        >
          {value}
          {idx < parts.length - 1 && <span className="mx-2">/</span>}
        </Link>
      ))}
    </div>
  );
};

export const ItemDetails = (details: ItemDetail) => {
  const { trigger: addToCart, isMutating } = useAddToCart(details.id);

  const t = useTranslations();

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
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
          {/* Image Section */}

          <div className="flex items-center justify-center">
            <img
              className="max-w-full mix-blend-multiply h-auto object-contain product-image"
              src={makeImageUrl(img)}
              alt={title}
            />
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 product-name">
                {title}
              </h2>
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
                    <span className="text-gray-500 text-sm">
                      {t("common.price")}
                    </span>
                    <div className="text-4xl font-bold text-gray-900">
                      <Price values={values} disclaimer={disclaimer} />
                    </div>
                  </div>
                  <button
                    className={cm(
                      "bg-blue-600 text-white px-4 py-2 text-center rounded-lg transition-all hover:bg-blue-700 items-center gap-3 text-lg",
                      isMutating ? "animate-pulse" : ""
                    )}
                    onClick={() => addToCart({ sku: details.sku, quantity: 1 })}
                  >
                    {t("cart.add")}
                  </button>
                </div>
                <PopulateAdminDetails id={id} />
                <StockList stock={stock} stockLevel={stockLevel} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="mt-6 space-y-6 md:mt-16 md:space-y-16">
          <BreadCrumbs values={values} />
          <RelationGroups values={values} />

          <div className="animating-element">
            <Properties values={details.values} />
          </div>

          <div className="animating-element">
            <h3 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-6 mb-8">
              {t("common.similar")}
            </h3>
            <RelatedItems id={details.id} />
          </div>
        </div>
      </div>
    </>
  );
};
