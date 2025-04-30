import { useEffect } from "react";

export const useSwipeAway = (
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void
) => {
  useEffect(() => {
    if (!ref.current) return;
    const handleTouchStart = (e: TouchEvent) => {
      console.log("touchstart", e.touches[0]);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (ref.current) {
        console.log("touchmove", e);
        const touch = e.touches[0];
        const rect = ref.current.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
          onClose();
        }
      }
    };
    const c = ref.current;
    c.addEventListener("touchstart", handleTouchStart);
    c.addEventListener("touchmove", handleTouchMove);
    return () => {
      c.removeEventListener("touchstart", handleTouchStart);
      c.removeEventListener("touchmove", handleTouchMove);
    };
  }, [ref, onClose]);
};
