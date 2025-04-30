import { PropsWithChildren, useEffect, useRef } from "react";

type SidebarProps = {
  open: boolean;
  side?: "left" | "right";
  setOpen: (open: boolean) => void;
};

const useSwipeAway = (
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

export const Sidebar = ({
  open,
  side = "left",
  setOpen,
  children,
}: PropsWithChildren<SidebarProps>) => {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (ref.current) {
      if (open) {
        ref.current.showModal();
      } else {
        ref.current.close();
      }
    }
  }, [open]);
  useSwipeAway(ref, () => {
    ref.current?.close();
  });
  useEffect(() => {
    if (ref.current) {
      const c = ref.current;
      const handleClose = () => setOpen(false);

      c.addEventListener("click", (e) => {
        if (e.target === c) {
          c.close();
        }
      });
      c.addEventListener("cancel", handleClose);
      c.addEventListener("close", handleClose);
      return () => {
        c?.removeEventListener("close", handleClose);
        c?.removeEventListener("cancel", handleClose);
      };
    }
  }, [ref]);
  return (
    <dialog ref={ref} className={side}>
      {children}
    </dialog>
  );
};
