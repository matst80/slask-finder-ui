import { ShoppingCart, X } from "lucide-react";
import { useDetails } from "../appState";
import { useFacetList, useRelatedItems } from "../searchHooks";
import { useMemo } from "react";
import { byPrio, makeImageUrl } from "../utils";
import { ItemDetail } from "../types";
import { stores } from "../stores";
import { ResultItem } from "./ResultItem";
import { useAddToCart } from "../cartHooks";

const ignoreFaceIds = [3, 4, 5, 10, 11, 12, 13];

const StockList = ({ stock }: Pick<ItemDetail, "stock">) => {
  if (stock == null) return null;
  return (
    <div>
      <h3 className="text-lg font-bold">Lager</h3>
      <ul>
        {stock.map((s) => {
          const store = stores.find((store) => store.id === s.id);
          if (!store) return null;
          return (
            <li key={s.id}>
              {store?.name}: {s.level}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const RelatedItems = ({ id }: Pick<ItemDetail, "id">) => {
  const { data, isLoading } = useRelatedItems(id);

  return (
    <div>
      <h3 className="text-lg font-bold">Relaterade produkter</h3>
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

export const ItemDetails = () => {
  const [details, setDetails] = useDetails();
  const { data } = useFacetList();
  const { trigger: addToCart } = useAddToCart();
  const fields = useMemo(() => {
    if (!details) return [];
    const { values, numberValues, integerValues } = details;

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
      .sort(byPrio);
  }, [details, data]);
  if (!details) return null;
  const { title, img, bp, stockLevel, stock, buyable, buyableInStore, id } =
    details;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full lg:min-w-[800px] max-w-lg max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={() => setDetails(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div className="pb-6">
          {img != null && (
            <div className="px-6">
              <img
                className={`w-full h-auto object-contain`}
                src={makeImageUrl(img)}
                alt={title}
              />
            </div>
          )}
          <div className="flex justify-between">
            <ul>{bp?.split("\n").map((txt) => <li key={txt}>{txt}</li>)}</ul>
            {(buyable || buyableInStore) && (
              <div>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex"
                  onClick={() => addToCart({ id: String(id), quantity: 1 })}
                >
                  Lägg i kundvagn <ShoppingCart />
                </button>
              </div>
            )}
          </div>
          {stockLevel != null && <p>I lager online: {stockLevel}</p>}
          <StockList stock={stock} />
        </div>
        <RelatedItems id={details.id} />
        <div className="grid grid-cols-2 gap-2">
          {fields.map((field) => (
            <div key={field.id} className="mb-2">
              <h3 className="text-lg font-bold flex gap-4 items-center">
                {field.name}
              </h3>
              <p className="text-gray-700">{field.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
