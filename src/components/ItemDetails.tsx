import {
  useCompatibleItems,
  useFacetMap,
  useRelatedItems,
  useRelationGroups,
} from "../hooks/searchHooks";
import { PropsWithChildren, useCallback, useMemo, useState } from "react";
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

export type StoreWithStock = Store & {
  stock: string;
  distance: number | null;
};

const useSwiper = () => {
  return useCallback((ref: HTMLDivElement | HTMLElement | null) => {
    if (ref == null) return;
    ref.querySelectorAll(".swiper-button").forEach((el) => {
      el.remove();
    });
    new MutationObserver((list) => {
      console.log("Mutation", list);
    }).observe(ref, {
      childList: true,
    });
    ref.addEventListener("scroll", (e) => {
      const el = e.target as HTMLDivElement;
      const scrollLeft = el.scrollLeft;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      const scrollPercent = (scrollLeft / maxScrollLeft) * 100;

      prevBtn.style.opacity = scrollPercent > 0 ? "1" : "0";
      nextBtn.style.opacity = scrollPercent < 100 ? "1" : "0";
    });
    const scroll = (dir: "next" | "prev") => (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = ref as HTMLDivElement;
      const scrollAmount = el.clientWidth;
      const scrollLeft = el.scrollLeft;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (dir === "next") {
        el.scrollTo({
          left: Math.min(scrollLeft + scrollAmount, maxScrollLeft),
          behavior: "smooth",
        });
      } else {
        el.scrollTo({
          left: Math.max(scrollLeft - scrollAmount, 0),
          behavior: "smooth",
        });
      }
    };
    const [nextBtn, prevBtn] = ["next", "prev"].map((dir) => {
      const btn = globalThis.document.createElement("button");
      btn.className = `swiper-button-${dir}`;
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-${dir}"><polyline points="${
        dir === "next" ? "9 18 15 12 9 6" : "15 6 9 12 15 18"
      }"></polyline></svg>`;
      btn.addEventListener("click", scroll(dir as "next" | "prev"));
      btn.classList.add("swiper-button");
      return btn;
    });
    ref.appendChild(nextBtn);
    ref.appendChild(prevBtn);
  }, []);
};

const ProductCarouselContainer = ({
  children,
  ...context
}: PropsWithChildren<{ list_id: string; list_name: string }>) => {
  const swiperRef = useSwiper();
  return (
    <TrackingProvider handlers={[googleTracker(context)]}>
      <ImpressionProvider>
        <div
          ref={swiperRef}
          className="max-w-[100vw] w-[100vw] md:max-w-screen -mx-4 md:mx-0 md:w-full overflow-y-visible overflow-x-auto md:overflow-x-hidden snap-x"
        >
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
      <div className="flex w-fit">
        {isLoading && <p>Laddar...</p>}
        {data?.map((item, idx) => (
          <CarouselItem key={item.id}>
            <ResultItem {...item} position={idx} />
          </CarouselItem>
        ))}
      </div>
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
      <div className="flex w-fit">
        {isLoading && <Loader size="md" />}
        {hits?.map((item, idx) => (
          <CarouselItem key={item.id}>
            <ResultItem {...item} position={idx} />
          </CarouselItem>
        ))}
      </div>
    </ProductCarouselContainer>
  );
};

const CarouselItem = ({ children }: PropsWithChildren) => {
  return (
    <div className="shrink-0 w-[300px] flex snap-start animating-element">
      {children}
    </div>
  );
};

export const CompatibleItems = ({ id }: Pick<ItemDetail, "id">) => {
  const { data, isLoading } = useCompatibleItems(id);

  return (
    <ProductCarouselContainer list_id="compatible" list_name="Compatible">
      <div className="flex w-fit">
        {isLoading && <p>Laddar...</p>}
        {data?.map((item, idx) => (
          <CarouselItem key={item.id}>
            <ResultItem {...item} position={idx} />
          </CarouselItem>
        ))}
      </div>
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
          {/* <QueryMerger query={query} /> */}
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
                    onClick={() =>
                      addToCart(
                        { sku: details.sku, quantity: 1 },
                        toEcomTrackingEvent(details, 0)
                      )
                    }
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
