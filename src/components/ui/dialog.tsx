import { PropsWithChildren, useEffect, useRef } from "react";
import { cm } from "../../utils";

type DialogProps = {
  open: boolean;
  attached?: "dialog" | "bottom" | "left" | "right";
  setOpen: (open: boolean) => void;
};

export const Dialog = ({
  open,
  setOpen,
  attached = "dialog",
  children,
}: PropsWithChildren<DialogProps>) => {
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
    <dialog ref={ref} className={cm(attached)}>
      {children}
    </dialog>
  );
};
