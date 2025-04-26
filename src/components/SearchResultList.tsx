import { PlaceholderItem, ResultItem } from "./ResultItem";
import { useQuery } from "../lib/hooks/useQuery";
import { ImpressionProvider } from "../lib/hooks/ImpressionProvider";
import { useEffect, useRef } from "react";

// const searchList = [
//   {
//     title: "I lager i falun",
//     href: "#stock=2299&page=0",
//   },
//   {
//     title: "Alla produkter",
//     href: "#i=4%3D0-169999999",
//   },
//   {
//     title: "Rabatterade produkter",
//     href: "#i=5%3D0-169999999",
//   },
// ];

const NoResults = () => {
  return <div>No results</div>;
  // const { data } = useCategories();
  // return (
  //   <div>
  //     <ul className="mt-2">
  //       {data?.sort(byName).map((category, idx) => (
  //         <CategoryItem
  //           key={category.value}
  //           {...category}
  //           level={1}
  //           defaultOpen={idx < 3}
  //         />
  //       ))}
  //     </ul>
  //     <div className="flex gap-4 mt-6">
  //       {searchList.map(({ title, href }) => (
  //         <ButtonLink href={href}>{title}</ButtonLink>
  //       ))}
  //     </div>
  //   </div>
  // );
};

export const SearchResultList = () => {
  const {
    isLoading,
    hits,
    addPage,
    query: { page, pageSize },
  } = useQuery();
  const loadingRef = useRef(false);
  const canLoadMoreRef = useRef(true);
  const endRef = useRef<HTMLDivElement>(null);
  const start = (page ?? 0) * (pageSize ?? 40);

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

  if (isLoading && hits.length < 1) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 md:gap-2 -mx-4 md:-mx-0">
        {new Array(pageSize)?.map((_, idx) => (
          <PlaceholderItem key={`p-${idx}`} />
        ))}
      </div>
    );
  }

  if (!hits.length && (hits == null || hits.length < 1)) {
    return <NoResults />;
  }

  return (
    <ImpressionProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 md:gap-2 -mx-4 md:-mx-0">
        {hits?.map((item, idx) => (
          <ResultItem key={item.id} {...item} position={start + idx} />
        ))}
        <div ref={endRef} className="col-span-full h-20"></div>
      </div>
    </ImpressionProvider>
  );
};

// export const CategoryList = () => {
//   const { data } = useCategories();
//   return (
//     <div>
//       <ul>
//         {data?.sort(byName).map((category) => (
//           <CategoryItem key={category.value} {...category} level={1} />
//         ))}
//       </ul>
//     </div>
//   );
// };
