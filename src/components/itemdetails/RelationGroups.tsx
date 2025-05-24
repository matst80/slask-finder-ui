"use client";
import { useMemo, useState } from "react";
import { ItemValues } from "../../lib/types";
import { useAdmin } from "../../hooks/appState";
import { useRelationGroups } from "../../hooks/searchHooks";
import { CompatibleItems } from "./CompatibleItems";
import { RelationGroupCarousel } from "./RelationGroupCarousel";
import { hasRequiredValue } from "./helpers";

export const RelationGroups = ({
  values,
  id,
}: {
  values: ItemValues;
  id: number;
}) => {
  const [isAdmin] = useAdmin();
  const [open, setOpen] = useState(false);
  const { data } = useRelationGroups();
  const validGroups = useMemo(
    () =>
      data?.filter((group) =>
        group.requiredForItem.every((requirement) =>
          hasRequiredValue(requirement, values[requirement.facetId])
        )
      ) ?? [],
    [values, data]
  );

  return (
    <div>
      <CompatibleItems id={id} />
      {validGroups.length > 0 && isAdmin && (
        <button
          className="underline hover:no-underline"
          onClick={() => setOpen((p) => !p)}
        >
          Show group relations
        </button>
      )}
      {open && (
        <>
          {validGroups.map((group, idx) => {
            return (
              <RelationGroupCarousel
                key={group.key}
                group={group}
                values={values}
                defaultOpen={idx === 0}
              />
            );
          })}
        </>
      )}
    </div>
  );
};
