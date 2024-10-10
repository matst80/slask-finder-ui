import useSWR from "swr";
import { getTrackingQueries } from "../api";

export const QueriesView = () => {
  const { data } = useSWR("/api/queries", getTrackingQueries);

  return (
    <div>
      <h1 className="font-bold text-xl">Queries</h1>
      <div>
        {Object.entries(data ?? {})
          .sort(([_, a], [__, b]) => b - a)
          .map(([query, value], i) => (
            <div key={i}>
              <h2>
                {query} ({value})
              </h2>
            </div>
          ))}
      </div>
    </div>
  );
};
