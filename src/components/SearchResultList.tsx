import { useEffect, useRef, useState } from "react";
import { useCategories } from "../categoryHooks";
import { Category } from "../types";
import { ResultItem } from "./ResultItem";
import { SquareMinus, SquarePlus } from "lucide-react";
import { useFilters, useHashQuery, useHashResultItems } from "../searchHooks";
import { trackImpression } from "../beacons";

const textSize = (level: number) => {
  switch (level) {
    case 1:
      return "text-xl";
    case 2:
      return "text-lg";
    case 3:
      return "text-base";
    default:
      return "text-sm";
  }
};

const byName = (a: Category, b: Category) => a.value.localeCompare(b.value);

const CategoryItem = ({
  value,
  children,
  level,
}: Category & { level: number }) => {
  const { addKeyFilter } = useFilters();
  const [open, setOpen] = useState(false);
  return (
    <li>
      <div className="flex gap-4 items-center">
        <button onClick={() => setOpen((p) => !p)}>
          {open ? (
            <SquareMinus className="size-5" color="gray" />
          ) : children?.length ? (
            <SquarePlus className="size-5" color="gray" />
          ) : (
            <div className="size-5"></div>
          )}
        </button>
        <button
          className={textSize(level)}
          onClick={() => addKeyFilter(9 + level, value)}
        >
          {value}
        </button>
      </div>
      {open && (
        <ul className="pl-4">
          {children &&
            children
              .sort(byName)
              .map((child: Category) => (
                <CategoryItem key={child.value} {...child} level={level + 1} />
              ))}
        </ul>
      )}
    </li>
  );
};

const searchList = [
  {
    title: "I lager i falun",
    href: "#stock=2299&page=0",
  },
  {
    title: "Alla produkter",
    href: "#i=4%3D1-99999999900",
  },
  {
    title: "Rabatterade produkter",
    href: "#i=5%3D1-99999999900",
  },
];

const NoResults = () => {
  const { data } = useCategories();
  return (
    <div>
      <h2 className="text-2xl">Inga resultat 😭</h2>
      <p>Sök eller välj en kategori för att börja</p>
      <ul className="mt-10">
        {data?.sort(byName).map((category) => (
          <CategoryItem key={category.value} {...category} level={1} />
        ))}
      </ul>
      <div className="flex gap-4 mt-6">
        {searchList.map(({ title, href }) => (
          <a className="bg-gray-200 rounded-lg px-3 py-1" href={href}>
            {title}
          </a>
        ))}
      </div>
    </div>
  );
};

export const SearchResultList = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { data: results, isLoading: loadingItems } = useHashResultItems();
  const {
    query: { page, pageSize },
  } = useHashQuery();

  useEffect(() => {
    if (ref.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries
            .filter((d) => d.isIntersecting)
            .forEach((entry) => {
              const target = entry.target as HTMLElement;
              const id = target.dataset.id;
              const position = Number(target.dataset.position);
              if (id != null && !isNaN(position)) {
                trackImpression(id, position);
              }
            });
        },
        { threshold: 1 }
      );
      ref.current.querySelectorAll(".result-item").forEach((item) => {
        observer.observe(item);
      });
      return () => observer.disconnect();
    }
  }, [results]);

  const start = (page ?? 0) * (pageSize ?? 40);
  if (loadingItems && (!results || !results.length)) {
    return <div>Loading...</div>;
  }

  if (!results || !results.length) {
    return <NoResults />;
  }
  return (
    <div
      ref={ref}
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
    >
      {results?.map((item, idx) => (
        <ResultItem key={item.id} {...item} position={start + idx} />
      ))}
    </div>
  );
};
