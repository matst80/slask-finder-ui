import { useMemo } from "react";
import Link from "next/link";
import { ItemValues } from "../../lib/types";
import { queryToHash } from "../../hooks/search-utils";

export const BreadCrumbs = ({ values }: { values: ItemValues }) => {
  const parts = useMemo(() => {
    return [10, 11, 12, 13]
      .map((id) => ({ id, value: values[id] }))
      .filter(
        (d) =>
          d.value != null && typeof d.value === "string" && d.value.length > 0
      );
  }, [values]);
  return (
    <div className="inline-flex items-center overflow-x-auto max-w-full mb-4">
      {parts.map(({ id, value }, idx) => (
        <Link
          href={`/#${queryToHash({
            page: 0,
            string: [
              {
                id,
                value: [String(value)],
              },
            ],
          })}`}
          key={idx}
          className="text-sm grow-0 shrink-0 text-gray-500 hover:text-blue-600 cursor-pointer"
        >
          {value}
          {idx < parts.length - 1 && <span className="mx-2">/</span>}
        </Link>
      ))}
    </div>
  );
};
