import { ReactNode, useRef, useEffect, Fragment, createElement } from "react";
import { useQuery } from "../lib/hooks/useQuery";
import { Item } from "../lib/types";
import { Loader } from "./Loader";

export const InfiniteHitList = ({
  children,
  loader,
  as = "div",
}: {
  as?: keyof HTMLElementTagNameMap;
  loader?: ReactNode;
  children: (item: Item & { position: number }) => ReactNode;
}) => {
  const { hits, addPage, query } = useQuery();
  const loadingRef = useRef(false);
  const canLoadMoreRef = useRef(true);
  const endRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!endRef.current) return;
    const elm = endRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          !loadingRef.current &&
          canLoadMoreRef.current
        ) {
          elm.classList.add("opacity-100");
          elm.classList.remove("opacity-0");
          // Only load more if we have more results to fetch
          loadingRef.current = true;
          addPage().then(({ hasMorePages }) => {
            canLoadMoreRef.current = hasMorePages;
            setTimeout(() => {
              elm.classList.add("opacity-0");
              elm.classList.remove("opacity-100");
              loadingRef.current = false;
            }, 250);
            // if (!hasMorePages) {
            //   // No more pages to load, stop observing
            //   observer.unobserve(elm);
            // }
          });
        }
      },
      { threshold: 0.1 } // Trigger when at least 90% of the element is visible
    );

    observer.observe(endRef.current);

    // Clean up the observer on unmount
    return () => {
      observer.unobserve(elm);
      observer.disconnect();
    };
  }, [endRef, loadingRef, addPage]);
  useEffect(() => {
    // Reset the loading state when the query changes
    console.log("query changed", query);
    canLoadMoreRef.current = true;
  }, [query]);
  return (
    <>
      {hits?.map((item, idx) => (
        <Fragment key={item.id}>
          {children({ ...item, position: idx })}
        </Fragment>
      ))}
      {createElement(
        as,
        {
          ref: endRef,
          className:
            "opacity-0 transition-opacity flex items-center justify-center w-full min-h-16",
        },
        loader ?? <Loader size="md" variant="default" />
      )}
    </>
  );
};
