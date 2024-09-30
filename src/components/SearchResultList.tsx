import { useState } from "react";
import { useCategories } from "../categoryHooks";
import { useFilters, useSearchContext } from "../SearchContext";
import { Category } from "../types";
import { ResultItem } from "./ResultItem";
import { ChevronDown, ChevronUp } from "lucide-react";

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
        <button
          className={textSize(level)}
          onClick={() => addKeyFilter(9 + level, value)}
        >
          {value}
        </button>
        <button onClick={() => setOpen((p) => !p)}>
          {open ? (
            <ChevronUp className="size-6" />
          ) : (
            <ChevronDown className="size-6" />
          )}
        </button>
      </div>
      {open && (
        <ul className="pl-4">
          {children &&
            children.map((child: Category) => (
              <CategoryItem key={child.value} {...child} level={level + 1} />
            ))}
        </ul>
      )}
    </li>
  );
};

const NoResults = () => {
  const { data } = useCategories();
  return (
    <div>
      <h2 className="text-2xl">Inga resultat 😭</h2>
      <p>Sök eller välj en kategori för att börja</p>
      <ul className="mt-10">
        {data?.map((category) => (
          <CategoryItem key={category.value} {...category} level={1} />
        ))}
      </ul>
    </div>
  );
};

export const SearchResultList = () => {
  const { results, page, pageSize, loadingItems } = useSearchContext();

  const start = page * pageSize;
  if (loadingItems && (!results || !results.items.length)) {
    return <div>Loading...</div>;
  }

  if (!results || !results.items.length) {
    return <NoResults />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {results?.items.map((item, idx) => (
        <ResultItem key={item.id} {...item} position={start + idx} />
      ))}
    </div>
  );
};
