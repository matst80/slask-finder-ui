import { useMemo } from "react";
import useSWR from "swr";
import { getStores } from "./api";

export const useStores = () => {
  return useSWR("/api/stores", () => getStores(), { revalidateOnFocus: false });
};

export const useStoreWithId = (id: string) => {
  const { data: stores, isLoading } = useStores();
  const store = useMemo(() => {
    return stores?.find((d) => d.id === id);
  }, [stores, id]);
  return {
    store,
    isLoading,
  };
};
