import {
  queryToHash,
  useCompatibleItems,
  useCosineRelatedItems,
  useFacetMap,
  useRelatedItems,
  useRelationGroups,
} from "../hooks/searchHooks";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cm, isDefined, makeImageUrl } from "../utils";
import {
  ItemDetail,
  ItemsQuery,
  ItemValues,
  KeyField,
  NumberField,
  RelationGroup,
  RelationMatch,
  relationValueConverters,
} from "../lib/types";
import { Store } from "../lib/datalayer/stores";
import { CompareButton, ResultItem } from "./ResultItem";
import { useAddToCart } from "../hooks/cartHooks";
import { Price, PriceValue } from "./Price";
import { QueryProvider } from "../lib/hooks/QueryProvider";
import { Button, ButtonLink } from "./ui/button";
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
import { Loader } from "./Loader";
import { BotMessageSquare, UserCog } from "lucide-react";
import { toEcomTrackingEvent } from "./toImpression";
import { Stars } from "./Stars";
import { QueryUpdater } from "./QueryMerger";
import { useSwitching } from "../lib/hooks/useSwitching";
import { useProductData } from "../lib/utils";
import {
  AiShoppingProvider,
  MessageList,
  QueryInput,
} from "../pages/AiShopper";
import { convertDetails } from "../pages/tools";
import { Sidebar } from "./ui/sidebar";

export type StoreWithStock = Store & {
  stock: string;
  distance: number | null;
};

const ProductCarouselContainer = ({
  children,
}: PropsWithChildren<{ list_id: string; list_name: string }>) => {
  return (
    <ImpressionProvider>
      <div className="max-w-[100vw] w-[100vw] md:max-w-screen -mx-4 md:mx-0 md:w-full carousel">
        {children}
      </div>
    </ImpressionProvider>
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

export const CosineRelatedItems = ({ id }: Pick<ItemDetail, "id">) => {
  const { data, isLoading } = useCosineRelatedItems(id);

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
  const { data, isLoading } = useCompatibleItems(id, []);
  const [productType, setProductTypes] = useSwitching<string>(5000);
  useEffect(() => {
    setProductTypes(
      Array.from(
        new Set(
          data
            ?.map((d) => d.values[31158])
            .filter(isDefined)
            .map((d) => String(d))
        )
      )
    );
  }, [data]);
  if (!data || data.length === 0) return null;
  return (
    <div className="relative">
      <div className="text-2xl pt-6 mb-8">
        Har du glömt{" "}
        <span
          key={"slask-" + productType}
          className="text-black font-bold animate-pop underline underline-indigo-500"
        >
          {productType ?? ""}
        </span>
      </div>
      <ProductCarouselContainer list_id="compatible" list_name="Compatible">
        {isLoading && <Loader size="md" />}
        {data?.map((item, idx) => (
          <CarouselItem key={item.id}>
            <ResultItem {...item} position={idx} />
          </CarouselItem>
        ))}
      </ProductCarouselContainer>
    </div>
  );
};

export const CompatibleButton = ({ values }: Pick<ItemDetail, "values">) => {
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

  if (stringFilters.length === 0) return null;
  return (
    <ButtonLink
      to={`/#${queryToHash({
        page: 0,
        string: stringFilters,
        range: [],
      })}`}
      size="sm"
    >
      {t("common.show_compatible", {
        ids: stringFilters.map((f) => f.id).join(", "),
      })}
    </ButtonLink>
  );
};

type PossibleValue = string | string[] | number | undefined;

const getMatch = (
  requiredValue: string | number | string[],
  value: string | number | string[]
) => {
  if (Array.isArray(requiredValue)) {
    return requiredValue.some((part) =>
      Array.isArray(value)
        ? value.includes(part)
        : String(part) === String(value)
    );
  }
  return String(requiredValue) === String(value);
};

const hasRequiredValue = (
  { value: requiredValue, exclude = false }: RelationMatch,
  value: PossibleValue
) => {
  if (value == null) return false;
  if (requiredValue == null) return value != null;

  const match = getMatch(requiredValue, value);
  // console.log({ match, requiredValue, value, exclude });
  if (exclude) {
    return !match;
  }
  return match;
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
        exclude: query.exclude,
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
    <div key={group.groupId} className="mb-2 pb-2 animating-element">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen((p) => !p)}
          className={cm("text-xl font-bold transition-all", open ? "" : "")}
        >
          {group.name}
        </button>
        <Link
          to={`/#${queryToHash(query)}`}
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

const RelationGroups = ({ values, id }: Pick<ItemDetail, "values" | "id">) => {
  const [isAdmin] = useAdmin();
  const [open, setOpen] = useState(false);
  const { data } = useRelationGroups();
  const validGroups = useMemo(
    () =>
      data?.filter((group) =>
        group.requiredForItem.every((requirement) =>
          hasRequiredValue(requirement, values[requirement.facetId])
        )
      ) ?? [],
    [values, data]
  );

  return (
    <div>
      <CompatibleItems id={id} />
      {validGroups.length > 0 && isAdmin && (
        <button
          className="underline hover:no-underline"
          onClick={() => setOpen((p) => !p)}
        >
          Show group relations
        </button>
      )}
      {open && (
        <>
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
        </>
      )}
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
    console.log({ popularity });
    return (
      <>
        <div className="p-4 my-2 flex gap-2 items-center justify-between bg-amber-100 text-amber-800 rounded-lg">
          <PriceValue
            value={item.values[4] - possibleDiscount}
            className="font-bold"
          />
          {mp > 0 && <span>{mp}%</span>}
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
          to={`/#${queryToHash({
            page: 0,
            string: [
              {
                id,
                value: [String(value)],
              },
            ],
          })}`}
          key={idx}
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
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  if (!details) return null;
  const {
    title,
    img,
    bp,
    stock,
    buyable,
    description,
    buyableInStore,
    id,
    values,
    disclaimer,
  } = details;
  const { stockLevel, rating } = useProductData(values);

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
          {/* Image Section */}

          <div className="flex flex-col items-center justify-center">
            <img
              className="max-w-full mix-blend-multiply h-auto object-contain product-image"
              src={makeImageUrl(img)}
              alt={title}
            />
            {description != null && description.length > 1 && (
              <p className="leading-7 mt-6">{description}</p>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 product-name">
                {title}
              </h2>
              {rating != null && (
                <div className="my-3">
                  <Stars
                    rating={rating.rating}
                    numberOfRatings={rating.numberOfRatings}
                    showText={true}
                  />
                </div>
              )}
              {bp && (
                <ul className="space-y-3 text-gray-600">
                  {bp.split("\n").map((txt) =>
                    txt.length > 1 ? (
                      <li key={txt} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {txt}
                      </li>
                    ) : null
                  )}
                </ul>
              )}
            </div>

            {/* Price and Cart Section */}
            {(buyable || buyableInStore) && (
              <div className="flex flex-col gap-2">
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-1"
                    title="Ask AI assistant"
                    onClick={() => setOpen((p) => !p)}
                  >
                    <BotMessageSquare className="size-5" />
                  </Button>
                </div>
                <StockList stock={stock} stockLevel={stockLevel} />
              </div>
            )}
          </div>
        </div>
        <Sidebar side="right" open={open} setOpen={setOpen}>
          <div className="bg-white flex flex-col overflow-y-auto py-6 px-4 h-full w-full max-w-full md:max-w-lg">
            {open && <AiChatForCurrentProduct {...details} />}
          </div>
        </Sidebar>
        {/* Bottom Sections */}
        <div className="mt-6 space-y-6 md:mt-6 md:space-y-16">
          <BreadCrumbs values={values} />
          <RelationGroups values={values} id={id} />

          <GroupedProperties values={details.values} />

          <div className="animating-element">
            <h3 className="text-2xl font-bold text-gray-900 pb-6 mb-8">
              {t("common.similar")}
            </h3>
            <RelatedItems id={details.id} />
          </div>
          <div className="animating-element">
            <h3 className="text-2xl font-bold text-gray-900 pb-6 mb-8">
              {t("common.similar")} (ai)
            </h3>
            <CosineRelatedItems id={details.id} />
          </div>
        </div>
      </div>
    </>
  );
};

const AiChatForCurrentProduct = (item: ItemDetail) => {
  const { data: facets } = useFacetMap();
  const convertItem = useCallback(convertDetails(facets ?? {}), [facets]);
  if (!item || !facets) return null;
  return (
    <AiShoppingProvider
      messages={[
        {
          role: "system",
          content:
            "The user needs some help, details for the product: \n```json\n" +
            JSON.stringify(convertItem(item)) +
            "\n```",
        },
      ]}
    >
      <div className="flex flex-col gap-6 flex-1">
        <div className="flex-1 overflow-auto">
          <MessageList />
        </div>

        <QueryInput />
      </div>
    </AiShoppingProvider>
  );
};
