import useSWR from "swr";
import { getTrackingUpdates } from "../../datalayer/api";
import { ResultItem } from "../../components/ResultItem";

export const UpdatedItems = () => {
  const { data } = useSWR("/api/updated-items", getTrackingUpdates);

  return (
    <div>
      <h1 className="font-bold text-xl">Updated Items</h1>
      <div className="grid grid-cols-5 gap-5">
        {data?.map((item, i) => {
          return <ResultItem key={`update-${i}`} {...item} position={i} />;
        })}
      </div>
    </div>
  );
};
