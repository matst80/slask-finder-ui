import useSWR from "swr";
import { getTrackingQueries } from "../../lib/datalayer/api";

export const QueriesView = () => {
  const { data } = useSWR("/api/queries", getTrackingQueries);

  return (
    <div className=" p-6">
      <h1 className="font-bold text-2xl mb-6">Search Queries</h1>
      <div className="grid gap-4">
        {Object.entries(data ?? {})
          .sort(([, a], [, b]) => b - a)
          .map(([query, value], i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-800 font-medium">{query}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {value} searches
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
