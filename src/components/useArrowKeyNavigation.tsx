import { useRef, useEffect } from "react";

export type ArrowKeyNavigationOptions = {
  onEscape?: () => void;
  onNotFound?: (activeElement: Element | null) => void;
};

export const useArrowKeyNavigation = <T extends HTMLElement>(
  resultSelector: string,
  { onEscape, onNotFound }: ArrowKeyNavigationOptions
) => {
  const parentRef = useRef<T>(null);
  useEffect(() => {
    if (parentRef.current != null) {
      const ref = parentRef.current;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onEscape?.();
        } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          const step = e.key === "ArrowDown" ? 1 : -1;

          if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
            return true;
          }
          e.preventDefault();
          const possible: HTMLButtonElement[] = Array.from(
            ref.querySelectorAll(resultSelector)
          );
          const index = possible.findIndex((d) => d === document.activeElement);
          const next = index + step;
          if (next < 0) {
            onNotFound?.(document.activeElement);
            return false;
          }
          possible[index + step]?.focus();
          return false;
        }
        return true;
      };

      ref.addEventListener("keydown", handleKeyDown, {
        passive: false,
      });
      return () => {
        ref.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [parentRef]);
  return parentRef;
};
