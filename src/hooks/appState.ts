import { atom } from "jotai";
import { useAtom } from "jotai/react";
import { useEffect } from "react";
import { trackAction } from "../lib/datalayer/beacons";

const adminAtom = atom(false);

export const useKeyboardAdminToggle = () => {
  const [_, setAdmin] = useAtom(adminAtom);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        setAdmin((a) => !a);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [setAdmin]);
};

export const useFocusTracking = () => {
  useEffect(() => {
    const onBlur = () => {
      trackAction({ action: "lost-focus", reason: "navigation" });
    };
    const onFocus = () => {
      trackAction({ action: "got-focus", reason: "navigation" });
    };
    const onExit = () => {
      trackAction({ action: "exit", reason: "navigation" });
    };
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("beforeunload", onExit);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);
};

export const useAdmin = () => {
  return useAtom(adminAtom);
};
