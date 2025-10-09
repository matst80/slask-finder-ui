import { atom, useAtom } from "jotai";

const storeAtom = atom<string | null>(
  localStorage.getItem("favouriteStore") || null,
);

export const useFavouriteStore = () => {
  const [store, setStore] = useAtom(storeAtom);
  return [
    store,
    (storeId: string | null) => {
      setStore(storeId);
      localStorage.setItem("favouriteStore", storeId || "");
    },
  ] as const;
};
