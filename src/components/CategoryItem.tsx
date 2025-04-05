import { SquareMinus, SquarePlus } from "lucide-react";
import { useState } from "react";
import { Category } from "../types";
import { textSize } from "../utils";
import { useQuery } from "../hooks/QueryProvider";

export const byName = (a: Category, b: Category) =>
  a.value.localeCompare(b.value);

export const CategoryItem = ({
  value,
  children,
  level,
  defaultOpen = false,
}: Category & { level: number; defaultOpen?: boolean }) => {
  const { setQuery } = useQuery();
  const [open, setOpen] = useState(defaultOpen);
  const addKeyFilter = (id: number, value: string | string[]) =>
    setQuery((state) => {
      return { ...state, string: [{ id, value }] };
    });
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
