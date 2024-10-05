import { Star, Save } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useItemsPopularity, useUpdatePopularity } from "../popularityHooks";
import { useAdmin } from "../appState";

const useItemPopularity = (id: string) => {
  const { data: popularity, mutate } = useItemsPopularity();
  const { trigger: updatePopularity } = useUpdatePopularity();
  const [dirty, setDirty] = useState(false);
  const value = useMemo(() => popularity?.[id], [id, popularity]);
  const setValue = useCallback(
    (value: number) => {
      mutate({ ...popularity, [id]: value }, { revalidate: false });
      setDirty(true);
    },
    [id, popularity, mutate]
  );
  const commit = useCallback(() => {
    if (dirty && popularity != null) {
      updatePopularity(popularity).then(() => {
        setDirty(false);
      });
    }
  }, [popularity, dirty, updatePopularity]);
  return { value, setValue, commit, dirty };
};

export const PopularityOverride = ({ id }: { id: string }) => {
  const [admin] = useAdmin();
  const { value, setValue, dirty, commit } = useItemPopularity(id);
  if (!admin) return null;
  return (
    <div
      className="absolute top-0 left-0 bg-gray-200 p-1 rounded-br-md flex items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <Star size={18} />
      <span className="text-xs text-gray-600">
        <input
          type="number"
          value={value ?? 0}
          className="w-16 bg-gray-200 text-center border-none focus:ring-0"
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </span>
      {dirty && (
        <button onClick={commit}>
          <Save size={18} />
        </button>
      )}
    </div>
  );
};
