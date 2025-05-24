import { useMemo, useState } from "react";
import Link from "next/link";
import { RelationGroup, ItemValues } from "../../lib/types";
import { cm } from "../../utils";
import { queryToHash } from "../../hooks/search-utils";
import { QueryProvider } from "../../lib/hooks/QueryProvider";
import { QueryUpdater } from "../QueryMerger";
import { ResultCarousel } from "./ResultCarousel";
import { makeQuery } from "./helpers";

export const RelationGroupCarousel = ({
  group,
  values,
  defaultOpen = false,
}: {
  group: RelationGroup;
  values: ItemValues;
  defaultOpen?: boolean;
}) => {
  const query = useMemo(() => makeQuery(group, values), [group, values]);
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div key={group.groupId} className="mb-2 pb-2 animating-element">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen((p) => !p)}
          className={cm("text-xl font-bold transition-all", open ? "" : "")}
        >
          {group.name}
        </button>
        <Link
          href={`/#${queryToHash(query)}`}
          className={cm("text-sm hover:underline transition-all")}
        >
          Show all
        </Link>
      </div>
      {open && (
        <QueryProvider initialQuery={query}>
          <QueryUpdater query={query} />
          <ResultCarousel
            list_id={String(group.groupId)}
            list_name={group.name}
          />
        </QueryProvider>
      )}
    </div>
  );
};
