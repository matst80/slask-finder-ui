import { useEffect, useRef, useState } from "react";

export function useScreenWidth(
  minWidth: number,
  onChange?: (matches: boolean) => void
) {
  const isMounted = useRef<boolean>(false);
  const mediaMatcher = globalThis.window?.matchMedia?.(
    `(min-width: ${minWidth}px)`
  );
  const [isMatch, setIsMatch] = useState(false);

  useEffect(() => {
    if (!isMounted.current && mediaMatcher != null) {
      onChange?.(mediaMatcher.matches);
      setIsMatch(mediaMatcher.matches);
    }

    isMounted.current = true;

    const handleMediaChange = (e: MediaQueryListEvent) => {
      onChange?.(e.matches);
      setIsMatch(e.matches);
    };

    mediaMatcher.addEventListener("change", handleMediaChange);
    return () => mediaMatcher.removeEventListener("change", handleMediaChange);
  }, [mediaMatcher, onChange]);

  return isMatch;
}
