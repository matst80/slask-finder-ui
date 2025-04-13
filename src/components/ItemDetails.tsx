import { ShoppingCart } from "lucide-react";
import {
  useCompatibleItems,
  useFacetMap,
  useRelatedItems,
} from "../hooks/searchHooks";
import { useMemo, useState } from "react";
import { byPriority, isDefined, makeImageUrl } from "../utils";
import { ItemDetail } from "../lib/types";
import { stores } from "../lib/datalayer/stores";
import { ResultItem } from "./ResultItem";
import { useAddToCart } from "../hooks/cartHooks";
import { Price } from "./Price";
import { useQuery } from "../lib/hooks/QueryProvider";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const ignoreFaceIds = [3, 4, 5, 10, 11, 12, 13];

const StockList = ({ stock }: Pick<ItemDetail, "stock">) => {
  const [open, setOpen] = useState(false);
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
          {Object.keys(stock).map((s) => {
            const store = stores.find((store) => store.id === s);
            if (!store) return null;
            return (
              <li key={s} className="line-clamp-1 overflow-ellipsis">
                {store?.name}
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
    <div className="-mx-6">
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
    </div>
  );
};

export const CompatibleItems = ({ id }: Pick<ItemDetail, "id">) => {
  const { data, isLoading } = useCompatibleItems(id);

  return (
    <div className="-mx-6">
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
    </div>
  );
};

export const CompatibleButton = ({ values }: Pick<ItemDetail, "values">) => {
  const { setQuery } = useQuery();
  const { data } = useFacetMap();
  const stringFilters = useMemo(() => {
    const filter = Object.entries(values)
      .map(([id, value]) => {
        const facet = data?.[id];
        if (!facet || facet.linkedId == null) {
          return null;
        }
        if (facet.linkedId == 31158) {
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
      query: undefined,
    });
  };
  if (stringFilters.length === 0) return null;
  return (
    <Button size="sm" onClick={handleClick}>
      Visa kompatibla
    </Button>
  );
};

const Properties = ({
  values,
  isEdit,
}: Pick<ItemDetail, "values"> & {
  isEdit?: boolean;
}) => {
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
      .filter((value) => value != null)
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
            <h3 className="text-lg font-bold flex gap-4 items-center">
              {field.name}
            </h3>
            <p className="text-gray-700">
              {isEdit ? (
                <input
                  type={field.fieldType === "key" ? "text" : "number"}
                  defaultValue={field.value}
                  name={String(field.id)}
                />
              ) : (
                <span>
                  {field.value} ({field.id})
                </span>
              )}{" "}
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
                      console.log(
                        "change filter!",
                        field.linkedId,
                        field.value
                      );
                    }}
                  >
                    Visa kompatibla
                  </Link>
                )}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export const ItemDetails = (details: ItemDetail & { isEdit?: boolean }) => {
  const { trigger: addToCart } = useAddToCart();

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
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex"
                onClick={() => addToCart({ id, quantity: 1 })}
              >
                Lägg i kundvagn <ShoppingCart />
              </button>
              <StockList stock={stock} />
            </div>
          )}
        </div>
        {stockLevel != null && <p>I lager online: {stockLevel}</p>}
      </div>

      <h3 className="text-xl font-bold border-b border-gray-200 pb-2 mb-2">
        Kompatibla produkter
      </h3>
      <CompatibleItems id={details.id} />

      <Properties values={details.values} isEdit={details.isEdit} />
      <h3 className="text-xl font-bold border-b border-gray-200 pb-2 mb-2">
        Liknande produkter
      </h3>
      <RelatedItems id={details.id} />
    </>
  );
};
