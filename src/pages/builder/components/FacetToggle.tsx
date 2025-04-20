"use client";
import { SlidersHorizontalIcon, XIcon } from "lucide-react";
import { PropsWithChildren, useState } from "react";
import { FacetList } from "../../../components/Facets"


type FacetToggleProps = {
  topFilters: number[];
};

export const FacetToggle = ({
  children,
}: PropsWithChildren<FacetToggleProps>) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative flex-1">
      {open ? (
        <div className="border border-line w-full absolute left-0 right-0 bg-white z-10 shadow-2xl">
          <div className="flex flex-col p-4 gap-2 max-h-80 overflow-y-auto">
            <FacetList />
            
          </div>
          {children}

          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2"
          >
            <XIcon className="size-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      ) : (
        <button
          className="flex items-center gap-2 cursor-pointer border border-line p-1 px-2 w-full text-sm"
          onClick={() => setOpen(true)}
        >
          <SlidersHorizontalIcon className="size-5" />
          Show advanced filters
        </button>
      )}
    </div>
  );
};
