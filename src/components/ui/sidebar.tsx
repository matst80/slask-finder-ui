import { PropsWithChildren, useEffect, useRef } from "react";

type SidebarProps = {
  open: boolean;
  side?: "left" | "right";
  setOpen: (open: boolean) => void;
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
  // useSwipeAway(ref, () => {
  //   ref.current?.close();
  // });
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
