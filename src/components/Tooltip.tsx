import { PropsWithChildren, ReactNode, useId, useRef, useEffect } from "react";

export const Tooltip = ({
  popover,
  className,
  children,
}: PropsWithChildren<{ popover: ReactNode; className?: string }>) => {
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (buttonRef.current) {
      const button = buttonRef.current;

      const popover = document.getElementById(id);
      Object.assign(popover!.style, {
        opacity: 0,
        transition: "opacity 0.3s ease-in-out",
      });

      const onEnter = () => {
        const pos = button.getBoundingClientRect();
        if (popover == null) {
          return;
        }
        popover.showPopover();
        Object.assign(popover!.style, {
          opacity: 1,
          position: "absolute",
          //display: "block",
          top: `${pos.bottom + window.scrollY}px`,
          left: `${pos.left + window.scrollX - popover!.offsetWidth / 2}px`,
        });
      };
      const onLeave = () => {
        popover?.hidePopover();
      };

      button.addEventListener("mouseenter", onEnter);
      button.addEventListener("mouseleave", onLeave);
      return () => {
        button.removeEventListener("mouseenter", onEnter);
        button.removeEventListener("mouseleave", onLeave);
      };
    }
  }, [buttonRef]);
  return (
    <>
      <button
        className="inline-block px-1 -mt-1"
        ref={buttonRef}
        popoverTarget={id}
      >
        {children}
      </button>
      <div id={id} role="tooltip" popover="" className={className}>
        {popover}
      </div>
    </>
  );
};
