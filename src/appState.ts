import { atom } from "jotai";
import { ItemDetail } from "./types";
import { useAtom } from "jotai/react";
import { useEffect } from "react";

const adminAtom = atom(false);
const detailsAtom = atom<ItemDetail | null>(null);

export const useKeyboardAdminToggle = () => {
  const [_, setAdmin] = useAtom(adminAtom);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      console.log(e);
      if (e.key === "F2") {
        setAdmin((a) => !a);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [setAdmin]);
};

export const useAdmin = () => {
  return useAtom(adminAtom);
};

export const useDetails = () => {
  return useAtom(detailsAtom);
};
