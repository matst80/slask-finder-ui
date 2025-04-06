import useSWR from "swr";
import { getTrackingPopularity } from "../../lib/datalayer/api";
import { useItemData } from "../../hooks/trackingHooks";
import { makeImageUrl } from "../../utils";

const PopularItem = ({ itemId, value }: { itemId: number; value: number }) => {
  const { data } = useItemData(itemId);
  return (
    <div className="bg-black text-white aspect-square rounded-2xl relative flex flex-col items-center justify-center gap-4">
      <div>
        {data != null && (
          <div className="p-2 bg-white rounded-xl">
            <img
              src={makeImageUrl(data?.img)}
              alt={data?.title}
              className="size-32"
            />
          </div>
        )}
      </div>
      <span className="text-sm">{data?.title}</span>

      <h2 className="text-4xl font-bold absolute top-3 right-4">
        {value.toFixed(2)}
      </h2>
    </div>
  );
};

export const PopularItemsView = () => {
  const { data } = useSWR("/api/popular-items", getTrackingPopularity);
  return (
    <div>
      <h1 className="font-bold text-xl">Popular Items</h1>
      <div className="grid grid-cols-5 gap-5">
        {Object.entries(data ?? {})
          .sort(([_, a], [__, b]) => b - a)
          .slice(0, 10)
          .map(([item, value]) => (
            <PopularItem key={item} itemId={Number(item)} value={value} />
          ))}
      </div>
    </div>
  );
};
