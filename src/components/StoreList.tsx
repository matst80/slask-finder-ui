import { stores } from "../lib/datalayer/stores";
import { Item } from "../lib/types";

export const StoreList = ({ stock }: { stock: Item["stock"] }) => {
  return (
    <div className="absolute bg-white p-4">
      {Object.entries(stock ?? {})?.map(([id, level]) => {
        const storeName = stores.find((d) => d.id === id)?.name ?? id;
        return (
          <div>
            {storeName}: {level}
          </div>
        );
      })}
    </div>
  );
};
