import useSWR from "swr";
import { getTrackingPopularity } from "../../lib/datalayer/api";
import { useItemData } from "../../hooks/trackingHooks";
import { makeImageUrl } from "../../utils";
import { useTranslations } from "../../lib/hooks/useTranslations";

const PopularItem = ({ itemId, value }: { itemId: number; value: number }) => {
  const { data } = useItemData(itemId);
  return (
    <div className="bg-linear-to-br from-gray-50 to-gray-100 text-gray-800 aspect-square rounded-2xl relative flex flex-col items-center justify-center gap-4 p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200">
      <div className="w-full flex justify-center">
        {data != null && (
          <div className="p-3 bg-white rounded-xl shadow-xs">
            <div className="relative">
              <img
                src={makeImageUrl(data?.img)}
                alt={data?.title}
                className="size-32 object-contain mix-blend-multiply"
              />
            </div>
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-center line-clamp-2">
        {data?.title}
      </span>

      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full shadow-xs">
        <h2 className="text-2xl font-bold text-gray-800">{value.toFixed(2)}</h2>
      </div>
    </div>
  );
};

export const PopularItemsView = () => {
  const { data } = useSWR("/api/popular-items", getTrackingPopularity);
  const t = useTranslations();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-bold text-3xl mb-8 text-gray-800">
        {t("tracking.items.title")}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Object.entries(data ?? {})
          .sort(([, a], [, b]) => b - a)
          .slice(0, 20)
          .map(([item, value]) => (
            <PopularItem key={item} itemId={Number(item)} value={value} />
          ))}
      </div>
    </div>
  );
};
