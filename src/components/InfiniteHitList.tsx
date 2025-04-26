import { ReactNode, useRef, useEffect, Fragment } from "react";
import { useQuery } from "../lib/hooks/useQuery";
import { Item } from "../lib/types";

export const InfiniteHitList = ({
  children,
}: {
  children: (item: Item & { position: number }) => ReactNode;
}) => {
  const { hits, addPage } = useQuery();
  const loadingRef = useRef(false);
  const canLoadMoreRef = useRef(true);
  const endRef = useRef<HTMLDivElement>(null);

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
          // Only load more if we have more results to fetch
          loadingRef.current = true;
          addPage().then(({ hasMorePages }) => {
            loadingRef.current = false;
            canLoadMoreRef.current = hasMorePages;
            if (!hasMorePages) {
              // No more pages to load, stop observing
              observer.unobserve(elm);
            }
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
  return (
    <>
      {hits?.map((item, idx) => (
        <Fragment key={item.id}>
          {children({ ...item, position: idx })}
        </Fragment>
      ))}

      <div ref={endRef} className="col-span-full h-20"></div>
    </>
  );
};
