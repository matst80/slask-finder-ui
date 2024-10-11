import useSWR from "swr";
import { getTrackingUpdates } from "../../api";
import { ResultItem } from "../../components/ResultItem";
import { ItemValues } from "../../types";

export const UpdatedItems = () => {
  const { data } = useSWR("/api/updated-items", getTrackingUpdates);

  return (
    <div>
      <h1 className="font-bold text-xl">Updated Items</h1>
      <div className="grid grid-cols-5 gap-5">
        {data?.map(({ values, ...item }, i) => {
          const transformedItem = Object.fromEntries(
            values.map(({ id, value }) => [String(id), value])
          ) as ItemValues;
          return (
            <ResultItem
              key={`update-${i}`}
              {...item}
              values={transformedItem}
              position={i}
            />
          );
        })}
      </div>
    </div>
  );
};
