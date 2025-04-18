import { useState } from "react";
import { useRelationGroups } from "../../hooks/searchHooks";
import { RelationGroup } from "../../lib/types";

const GroupEditor = ({ group }: { group: RelationGroup }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-400 p-4 rounded-md">
      <h2 onClick={() => setOpen((p) => !p)}>{group.name}</h2>
      {open && (
        <div>
          <ul>
            {group.additionalQueries?.map((relation) => (
              <li key={`${relation.facetId}-${relation.value}`}>
                {relation.facetId}: {relation.value}
              </li>
            ))}
          </ul>
          <ul>
            {group.requiredForItem?.map((relation) => (
              <li key={`${relation.facetId}-${relation.value}`}>
                {relation.facetId}: {relation.value}
              </li>
            ))}
          </ul>
          <ul>
            {group.relations?.map((relation) => (
              <li key={`${relation.fromId}-${relation.toId}`}>
                {relation.fromId} - {relation.toId} - {relation.converter}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const getKey = (group: RelationGroup) => {
  return (
    group.groupId +
    group.requiredForItem.map((r) => `${r.facetId}+${r.value}`).join(",")
  );
};

export const RelationGroupEditor = () => {
  const { data } = useRelationGroups();
  return (
    <div className="flex flex-col gap-4">
      {data?.map((group) => (
        <GroupEditor key={getKey(group)} group={group} />
      ))}
    </div>
  );
};
