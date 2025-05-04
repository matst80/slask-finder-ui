import {
  useCompatibleItems,
  useFacetMap,
  useRelatedItems,
  useRelationGroups,
} from "../hooks/searchHooks";
import { PropsWithChildren, useMemo, useState } from "react";
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
import { CompareButton, ResultItem } from "./ResultItem";
import { useAddToCart } from "../hooks/cartHooks";
import { Price, PriceValue } from "./Price";
import { QueryProvider } from "../lib/hooks/QueryProvider";
import { Button } from "./ui/button";
import { useAdmin } from "../hooks/appState";
import {
  getAdminItem,
  getAdminItemPopularity,
  ItemPopularity,
} from "../lib/datalayer/api";
import { useQuery } from "../lib/hooks/useQuery";
import { trackAction } from "../lib/datalayer/beacons";
import { StockList } from "./StockList";
import { Link } from "react-router-dom";
import { useTranslations } from "../lib/hooks/useTranslations";
import { GroupedProperties } from "./GroupedProperties";
import { ImpressionProvider } from "../lib/hooks/ImpressionProvider";
import { TrackingProvider } from "../lib/hooks/TrackingContext";
import { googleTracker } from "../tracking/google-tracking";
import { Loader } from "./Loader";
import { UserCog } from "lucide-react";
import { JsonView } from "../pages/tracking/JsonView";
import { toEcomTrackingEvent } from "./toImpression";
import { Stars } from "./Stars";
import { QueryUpdater } from "./QueryMerger";

export type StoreWithStock = Store & {
  stock: string;
  distance: number | null;
};

const ProductCarouselContainer = ({
  children,
  ...context
}: PropsWithChildren<{ list_id: string; list_name: string }>) => {
  return (
    <TrackingProvider handlers={[googleTracker(context)]}>
      <ImpressionProvider>
        <div className="max-w-[100vw] w-[100vw] md:max-w-screen -mx-4 md:mx-0 md:w-full carousel">
          {children}
        </div>
      </ImpressionProvider>
    </TrackingProvider>
  );
};

export const RelatedItems = ({ id }: Pick<ItemDetail, "id">) => {
  const { data, isLoading } = useRelatedItems(id);

  return (
    <ProductCarouselContainer list_id="related" list_name="Related">
      {isLoading && <Loader size="md" />}
      {data?.map((item, idx) => (
        <CarouselItem key={item.id}>
          <ResultItem {...item} position={idx} />
        </CarouselItem>
      ))}
    </ProductCarouselContainer>
  );
};

export const ResultCarousel = (context: {
  list_id: string;
  list_name: string;
}) => {
  const { hits, isLoading } = useQuery();

  return (
    <ProductCarouselContainer {...context}>
      {isLoading && <Loader size="md" />}
      {hits?.map((item, idx) => (
        <CarouselItem key={item.id}>
          <ResultItem {...item} position={idx} />
        </CarouselItem>
      ))}
    </ProductCarouselContainer>
  );
};

const CarouselItem = ({ children }: PropsWithChildren) => {
  return <div className="shrink-0 w-[300px] flex snap-start">{children}</div>;
};

export const CompatibleItems = ({ id }: Pick<ItemDetail, "id">) => {
  const { data, isLoading } = useCompatibleItems(id);

  return (
    <ProductCarouselContainer list_id="compatible" list_name="Compatible">
      {isLoading && <Loader size="md" />}
      {data?.map((item, idx) => (
        <CarouselItem key={item.id}>
          <ResultItem {...item} position={idx} />
        </CarouselItem>
      ))}
    </ProductCarouselContainer>
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
    <div key={group.groupId} className="mb-2 pb-2 animating-element">
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
          className={cm("text-sm hover:underline transition-all")}
        >
          Show all
        </Link>
      </div>
      {open && (
        <QueryProvider initialQuery={query}>
          <QueryUpdater query={query} />
          <ResultCarousel
            list_id={String(group.groupId)}
            list_name={group.name}
          />
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
  const [popularity, setPopularity] = useState<ItemPopularity | null>(null);
  if (!isAdmin) return null;
  if (item != null) {
    const mp = Math.max(item.mp ?? 0, 0);
    const possibleDiscount = item.values[4] * (mp / 100);
    return (
      <>
        <div className="p-4 my-2 flex gap-2 items-center justify-between bg-amber-100 text-amber-800 rounded-lg">
          <PriceValue
            value={item.values[4] - possibleDiscount}
            className="font-bold"
          />
          {mp > 0 && <span>{mp}%</span>}
        </div>
        <div className="my-2">
          <JsonView data={popularity} />
        </div>
      </>
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
        getAdminItemPopularity(id).then(setPopularity);
      }}
    >
      <UserCog className="size-5" />
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
  const { trigger: addToCart, isMutating } = useAddToCart();

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
  const hasRating = values?.["6"] != null && values?.["7"] != null;
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
              {hasRating && (
                <div className="my-3">
                  <Stars
                    rating={Number(values?.["6"]) / 10}
                    numberOfRatings={Number(values?.["7"])}
                    showText={true}
                  />
                </div>
              )}
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
              <div>
                <div className="grid grid-cols-2 gap-4 items-end">
                  <div>
                    <span className="text-gray-500 text-sm">
                      {t("common.price")}
                    </span>
                    <div className="text-4xl font-bold text-gray-900">
                      <Price values={values} disclaimer={disclaimer} />
                    </div>
                  </div>

                  <Button
                    variant="default"
                    onClick={() =>
                      addToCart(
                        { sku: details.sku, quantity: 1 },
                        toEcomTrackingEvent(details, 0)
                      )
                    }
                  >
                    {isMutating ? (
                      <Loader size="sm" />
                    ) : (
                      <span>{t("cart.add")}</span>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <CompareButton
                    item={details}
                    className="font-medium rounded-sm focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:cursor-not-allowed border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white/20 px-3 py-1 text-sm my-2"
                  />
                  <PopulateAdminDetails id={id} />
                </div>
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
            <GroupedProperties values={details.values} />
          </div>

          <div className="animating-element">
            <h3 className="text-2xl font-bold text-gray-900 pb-6 mb-8">
              {t("common.similar")}
            </h3>
            <RelatedItems id={details.id} />
          </div>
        </div>
      </div>
    </>
  );
};
