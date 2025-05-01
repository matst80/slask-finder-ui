import useSWR from "swr";
import { getTrackingQueries } from "../../lib/datalayer/api";
import { useTranslations } from "../../lib/hooks/useTranslations";

export const QueriesView = () => {
  const { data } = useSWR("/api/queries", getTrackingQueries);
  const t = useTranslations();
  return (
    <div className="p-4 md:p-6">
      <h1 className="font-bold text-2xl mb-6">{t("tracking.queries.title")}</h1>
      <div className="grid gap-4">
        {Object.entries(data ?? {})
          .sort(([, a], [, b]) => b - a)
          .map(([query, value], i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-xs p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-800 font-medium">{query}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {t("tracking.queries.searches", { value })}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
