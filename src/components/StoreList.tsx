import { stores } from "../datalayer/stores";
import { Item } from "../types";

export const StoreList = ({ stock }: { stock: Item["stock"] }) => {
  return (
    <div className="absolute bg-white p-4">
      {stock?.map(({ id, level }) => {
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
