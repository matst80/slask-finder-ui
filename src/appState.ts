import { atom } from "jotai";
import { Item } from "./types";
import { useAtom } from "jotai/react";

const adminAtom = atom(false);
const detailsAtom = atom<Item | null>(null);

export const useAdmin = () => {
  return useAtom(adminAtom);
};

export const useDetails = () => {
  return useAtom(detailsAtom);
};
