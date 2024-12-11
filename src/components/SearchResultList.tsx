import { useEffect, useRef } from "react";
import { useCategories } from "../hooks/categoryHooks";
import { ResultItem } from "./ResultItem";
import { useHashQuery, useHashResultItems } from "../hooks/searchHooks";
import { Impression, trackImpression } from "../datalayer/beacons";
import { ButtonLink } from "./ui/button";
import { byName, CategoryItem } from "./CategoryItem";

const searchList = [
  {
    title: "I lager i falun",
    href: "#stock=2299&page=0",
  },
  {
    title: "Alla produkter",
    href: "#i=4%3D0-169999999",
  },
  {
    title: "Rabatterade produkter",
    href: "#i=5%3D0-169999999",
  },
];

const NoResults = () => {
  const { data } = useCategories();
  return (
    <div>
      <ul className="mt-2">
        {data
          ?.sort(byName)
          .map((category, idx) => (
            <CategoryItem
              key={category.value}
              {...category}
              level={1}
              defaultOpen={idx < 3}
            />
          ))}
      </ul>
      <div className="flex gap-4 mt-6">
        {searchList.map(({ title, href }) => (
          <ButtonLink href={href}>{title}</ButtonLink>
        ))}
      </div>
    </div>
  );
};

export const SearchResultList = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { data: results, isLoading: loadingItems } = useHashResultItems();
  const {
    query: { page, pageSize, query },
  } = useHashQuery();

  useEffect(() => {
    const impressions = new Set<number>();
    let toPush: Impression[] = [];
    if (ref.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries
            .filter((d) => d.isIntersecting)
            .forEach((entry) => {
              const target = entry.target as HTMLElement;
              const id = Number(target.dataset.id);
              const position = Number(target.dataset.position);
              if (id != null && !isNaN(position)) {
                if (!impressions.has(id)) {
                  toPush.push({ id, position });
                  impressions.add(id);
                }
              }
            });
          if (toPush.length) {
            trackImpression(toPush);
            toPush = [];
          }
        },
        { threshold: 1 },
      );
      ref.current.querySelectorAll(".result-item").forEach((item) => {
        observer.observe(item);
      });
      return () => observer.disconnect();
    }
  }, [results, ref]);

  const items = results?.items ?? [];

  const start = (page ?? 0) * (pageSize ?? 40);
  if (loadingItems) {
    return <div>Loading...</div>;
  }

  if ((!items.length && (query == null || query.length < 1))) {
    return <NoResults />;
  }
  return (
    <div
      ref={ref}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
    >
      {items?.map((item, idx) => (
        <ResultItem key={item.id} {...item} position={start + idx} />
      ))}
    </div>
  );
};

export const CategoryList = () => {
  const { data } = useCategories();
  return (
    <div>
      <ul>
        {data
          ?.sort(byName)
          .map((category) => (
            <CategoryItem key={category.value} {...category} level={1} />
          ))}
      </ul>
    </div>
  );
};
