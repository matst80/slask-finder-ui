import { ShoppingCart } from "lucide-react";
import { queryToHash, useFacetList, useRelatedItems } from "../searchHooks";
import { useMemo, useState } from "react";
import { byPriority, makeImageUrl } from "../utils";
import { ItemDetail, ItemValues } from "../types";
import { stores } from "../stores";
import { ResultItem } from "./ResultItem";
import { useAddToCart } from "../cartHooks";
import { Price } from "./Price";

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
      <p>Finns i lager i {stock.length} butiker</p>
      {open && (
        <ul className="max-h-screen overflow-y-auto">
          {stock.map((s) => {
            const store = stores.find((store) => store.id === s.id);
            if (!store) return null;
            return (
              <li key={s.id} className="line-clamp-1 overflow-ellipsis">
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
            <ResultItem key={item.id} {...item} position={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

const Properties = ({
  values,
  numberValues,
  integerValues,
}: Pick<ItemDetail, "values" | "numberValues" | "integerValues">) => {
  const { data } = useFacetList();
  const fields = useMemo(() => {
    return [
      ...(values ?? []),
      ...(numberValues ?? []),
      ...(integerValues ?? []),
    ]
      .map((value) => {
        const facet = data?.find((f) => f.id === value.id);
        if (!facet || ignoreFaceIds.includes(facet.id)) {
          return null;
        }
        return {
          ...facet,
          ...value,
        };
      })
      .filter((value) => value != null)
      .sort(byPriority);
  }, [values, numberValues, integerValues, data]);
  return (
    <>
      <h3 className="text-xl font-bold border-b border-gray-200 pb-2 mb-2">
        Egenskaper ({fields.length})
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {fields.map((field) => (
          <div key={`prop-${field.id}-${field.type}`} className="mb-2">
            <h3 className="text-lg font-bold flex gap-4 items-center">
              {field.name}
            </h3>
            <p className="text-gray-700">
              {field.value}{" "}
              {field.linkedId != null &&
                field.linkedId > 0 &&
                field.value != null && (
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => {
                      globalThis.location.hash = queryToHash({
                        string: [
                          { id: field.linkedId!, value: String(field.value!) },
                        ],
                        page: 0,
                        stock: [],
                      });
                    }}
                  >
                    Visa kompatibla
                  </button>
                )}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export const ItemDetails = (details: ItemDetail) => {
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
    integerValues,
    disclaimer,
  } = details;
  return (
    <>
      <div className="pb-6 flex flex-col gap-4">
        <div className="px-6 pb-6 items-center justify-center w-full flex">
          <img
            className={`max-w-full w-screen-sm h-auto object-contain`}
            src={makeImageUrl(img)}
            alt={title}
          />
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
        <span className="text-xl font-bold">
          <Price
            values={
              Object.fromEntries(
                integerValues.map(({ id, value }) => [String(id), value])
              ) as ItemValues
            }
            disclaimer={disclaimer}
          />
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
        Relaterade produkter
      </h3>
      <RelatedItems id={details.id} />

      <Properties
        integerValues={details.integerValues}
        values={details.values}
        numberValues={details.integerValues}
      />
    </>
  );
};
