"use client";
import { SlidersHorizontalIcon } from "lucide-react";
import { PropsWithChildren, useState } from "react";
import Image from "next/image";
import { useBuilderContext } from "./builder";
import { FilteredFacetList, FacetList } from "./facet-context";

type FacetToggleProps = {
  topFilters: number[];
};

export const FacetToggle = ({
  children,
  topFilters,
}: PropsWithChildren<FacetToggleProps>) => {
  const [open, setOpen] = useState(false);
  const { appliedFilters } = useBuilderContext();
  const [showAll, setShowAll] = useState(false);
  return (
    <div className="relative flex-1">
      {open ? (
        <div className="border border-line w-full absolute left-0 right-0 bg-white z-1 shadow-2xl">
          <div className="flex flex-col p-4 gap-2 max-h-80 overflow-y-auto">
            <FilteredFacetList
              facetsToShow={topFilters.filter(
                (id) => !appliedFilters.some((d) => d.id == id),
              )}
            />
            {showAll && (
              <FacetList
                facetsToHide={[
                  ...appliedFilters.map((d) => d.id),
                  ...topFilters,
                ]}
              />
            )}
            <button
              className="inverted-link text-sm"
              onClick={() => setShowAll((p) => !p)}
            >
              {showAll ? "Give me less options" : "Give me more options!"}
            </button>
          </div>
          {children}

          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2"
          >
            <Image
              className={"w-8 h-8"}
              width={32}
              height={32}
              src="/assets_spa/images/close.svg"
              alt="close"
            />
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
