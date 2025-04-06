import { useEffect, useRef } from "react";
import { useCategories } from "../hooks/categoryHooks";
import { ResultItem } from "./ResultItem";
import { Impression, trackImpression } from "../datalayer/beacons";
import { ButtonLink } from "./ui/button";
import { byName, CategoryItem } from "./CategoryItem";
import { useQuery } from "../hooks/QueryProvider";
import { ImpressionProvider } from "../hooks/ImpressionProvider";

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
        {data?.sort(byName).map((category, idx) => (
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
  const {
    isLoading,
    hits,
    query: { page, pageSize },
  } = useQuery();

  const start = (page ?? 0) * (pageSize ?? 40);
  if (isLoading && hits.length < 1) {
    return <div>Loading...</div>;
  }

  if (!hits.length && (hits == null || hits.length < 1)) {
    return <NoResults />;
  }
  return (
    <ImpressionProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {hits?.map((item, idx) => (
          <ResultItem key={item.id} {...item} position={start + idx} />
        ))}
      </div>
    </ImpressionProvider>
  );
};

export const CategoryList = () => {
  const { data } = useCategories();
  return (
    <div>
      <ul>
        {data?.sort(byName).map((category) => (
          <CategoryItem key={category.value} {...category} level={1} />
        ))}
      </ul>
    </div>
  );
};
