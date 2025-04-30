import { X } from "lucide-react";
import { PropsWithChildren, useEffect, useRef } from "react";

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const Sidebar = ({
  open,
  setOpen,
  children,
}: PropsWithChildren<SidebarProps>) => {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    console.log("open", open, ref.current);
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
      const handleClose = (e: Event) => {
        console.log("dialog close event", e);
        setOpen(false);
      };
      c.addEventListener("click", (e) => {
        if (e.target === c) {
          setOpen(false);
        }
        console.log("clickevent", e.target, e.target === c);
      });
      c.addEventListener("cancel", handleClose);
      c.addEventListener("close", handleClose);
      return () => {
        c?.removeEventListener("close", handleClose);
      };
    }
  }, [ref]);
  return (
    <dialog ref={ref}>
      {open && (
        <>
          <button
            onClick={() => ref.current?.close()}
            className="text-gray-500 hover:text-gray-700 absolute top-3 right-3 rounded-full p-1 transition-colors duration-200"
          >
            <X size={24} />
          </button>
          <div className="border-r h-full p-6 border-r-gray-300 shadow-2xl bg-white min-w-sm">
            {children}
          </div>
        </>
      )}
    </dialog>
  );
};
