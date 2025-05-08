import { useRef, useCallback, useEffect } from "react";

type FocusOptions = {
  onOpen?: () => void;
  onClose?: () => void;
};

export const useDropdownFocus = ({ onOpen, onClose }: FocusOptions) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<HTMLElement>(null);
  const close = useCallback(() => {
    const elm = inputRef.current;
    const targetElm = targetRef.current;
    if (elm != null && targetElm != null) {
      targetElm.setAttribute("aria-hidden", "true");
      elm.setAttribute("aria-expanded", "false");
      onClose?.();
    }
  }, [inputRef, targetRef]);
  const open = useCallback(() => {
    const elm = inputRef.current;
    const targetElm = targetRef.current;
    if (elm != null && targetElm != null) {
      targetElm.setAttribute("aria-hidden", "false");
      elm.setAttribute("aria-expanded", "true");
      onOpen?.();
    }
  }, [inputRef, targetRef]);
  useEffect(() => {
    const elm = inputRef.current;
    if (elm != null) {
      const targetId = elm.getAttribute("aria-controls");
      const targetElm =
        targetId != null ? document.getElementById(targetId) : undefined;

      if (targetElm == null) {
        console.warn("No target element found for aria-controls", {
          targetId,
          targetElm,
        });
        return;
      }
      targetRef.current = targetElm;

      const blurHandler = (e: FocusEvent) => {
        const focusElement = e.relatedTarget as HTMLElement;
        const shouldClose =
          focusElement == null ||
          !(
            focusElement.classList.contains("smart-query") ||
            focusElement.classList.contains("trie") ||
            focusElement.parentElement == targetElm
          );
        if (shouldClose) {
          requestAnimationFrame(close);
        }
      };

      elm.addEventListener("focus", open);
      elm.addEventListener("blur", blurHandler);

      return () => {
        elm.removeEventListener("focus", open);
        elm.removeEventListener("blur", blurHandler);
        close();
      };
    }
  }, [inputRef]);

  return { inputRef, close, open } as const;
};
