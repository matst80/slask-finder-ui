import { ShoppingCart } from "lucide-react";
import {
  useCompatibleItems,
  useFacetMap,
  useRelatedItems,
  useRelationGroups,
} from "../hooks/searchHooks";
import { useMemo, useState } from "react";
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
import { stores } from "../lib/datalayer/stores";
import { ResultItem } from "./ResultItem";
import { useAddToCart } from "../hooks/cartHooks";
import { Price } from "./Price";
import { QueryProvider } from "../lib/hooks/QueryProvider";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useAdmin } from "../hooks/appState";
import { getAdminItem } from "../lib/datalayer/api";
import { useQuery } from "../lib/hooks/useQuery";

const ignoreFaceIds = [3, 4, 5, 10, 11, 12, 13];

const StockList = ({ stock }: Pick<ItemDetail, "stock">) => {
  const [open, setOpen] = useState(false);
  const storesWithStock = useMemo(() => {
    return Object.entries(stock ?? {})
      .map(([id, value]) => {
        const store = stores.find((store) => store.id === id);
        if (!store) return null;
        return { ...store, stock: value };
      })
      .filter(isDefined)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [stock]);
  if (stock == null) return null;
  return (
    <div
      onClick={() => setOpen((p) => !p)}
      className="py-2 px-4 border border-gray-500 rounded-md mt-4"
    >
      <h3 className="text-lg font-bold">Lager</h3>
      <p>Finns i lager i {Object.keys(stock ?? {}).length} butiker</p>
      {open && (
        <ul className="max-h-screen overflow-y-auto">
          {storesWithStock.map((s) => {
            return (
              <li key={s.id} className="line-clamp-1 overflow-ellipsis">
                {s.name}: {s.stock}
              </li>
            );
          })}
        </ul>
      )}
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
            className="flex-shrink-0 w-[250px] flex snap-start"
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
  const fields = useMemo(() => {
    return Object.entries(values)
      .map(([id, value]) => {
        const facet = data?.[id];
        if (!facet || ignoreFaceIds.includes(facet.id)) {
          return null;
        }
        return {
          ...facet,
          value,
        };
      })
      .filter(isDefined)
      .sort(byPriority);
  }, [values, data]);
  return (
    <>
      <h3 className="text-xl font-bold border-b border-gray-200 pb-2 mb-2">
        Egenskaper ({fields.length})
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {fields.map((field) => (
          <div key={`prop-${field.id}-${field.valueType}`} className="mb-2">
            <h3 className="flex gap-1 items-center">
              <span className="text-lg font-bold">{field.name}</span>
              <span className="hidden md:block text-sm text-gray-400">
                ({field.id})
              </span>
            </h3>
            <p className="text-gray-700">
              <span>
                {Array.isArray(field.value)
                  ? field.value.join(", ")
                  : String(field.value)}{" "}
              </span>{" "}
              {field.linkedId != null &&
                field.linkedId > 0 &&
                field.value != null && (
                  <Link
                    className="text-blue-500 hover:underline"
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
                      // console.log(
                      //   "change filter!",
                      //   field.linkedId,
                      //   field.value
                      // );
                    }}
                  >
                    Visa kompatibla ({field.linkedId})
                  </Link>
                )}
            </p>
          </div>
        ))}
      </div>
    </>
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
}: {
  group: RelationGroup;
  values: ItemValues;
}) => {
  const query = useMemo(() => makeQuery(group, values), [group, values]);
  const [open, setOpen] = useState(false);
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
      {validGroups.map((group) => {
        return (
          <RelationGroupCarousel
            key={group.key}
            group={group}
            values={values}
          />
        );
      })}
    </div>
  );
};

export const ItemDetails = (details: ItemDetail) => {
  const { trigger: addToCart, isMutating } = useAddToCart(details.id);
  const isAdmin = useAdmin();
  if (!details) return null;
  const {
    sku,
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
      <div className="pb-6 flex flex-col gap-4">
        <div className="px-6 py-6 bg-white rounded-xl items-center justify-center w-full flex">
          <img
            className={`max-w-full w-screen-sm h-auto object-contain`}
            src={makeImageUrl(img)}
            alt={title}
          />
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
        <span className="text-xl font-bold">
          <Price values={values} disclaimer={disclaimer} />
        </span>
        <div className="flex justify-between">
          <ul>
            {bp?.split("\n").map((txt) => (
              <li key={txt}>{txt}</li>
            ))}
          </ul>
          {(buyable || buyableInStore) && (
            <div>
              <button
                className={cm(
                  "bg-blue-500 text-white px-4 py-2 transition-all rounded hover:bg-blue-600 flex",
                  isMutating ? "animate-pulse" : ""
                )}
                onClick={() => addToCart({ sku, quantity: 1 })}
              >
                Lägg i kundvagn <ShoppingCart />
              </button>
              <StockList stock={stock} />
              {isAdmin && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => getAdminItem(id).then(console.log)}
                >
                  Test
                </Button>
              )}
            </div>
          )}
        </div>
        {stockLevel != null && <p>I lager online: {stockLevel}</p>}
      </div>

      <RelationGroups values={values} />
      {/* <h3 className="text-xl font-bold border-b border-gray-200 pb-2 mb-2">
        Kompatibla produkter
      </h3>
      <CompatibleItems id={details.id} /> */}

      <Properties values={details.values} />
      <h3 className="text-xl font-bold border-b border-gray-200 pb-2 mb-2">
        Liknande produkter
      </h3>
      <RelatedItems id={details.id} />
    </>
  );
};
