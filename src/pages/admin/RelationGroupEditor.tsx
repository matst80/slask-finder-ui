import { useMemo, useState } from "react";
import { useFacetMap, useRelationGroups } from "../../hooks/searchHooks";
import { Relation, RelationGroup, RelationMatch } from "../../lib/types";
import { QueryProvider } from "../../lib/hooks/QueryProvider";
import { ResultCarousel } from "../../components/ItemDetails";
import { Button } from "../../components/ui/button";
import { useRelationGroupsMutation } from "../../adminHooks";

const RelationMatchEditor = ({
  onChange,
  ...value
}: RelationMatch & { onChange: (data: RelationMatch) => void }) => {
  const { data } = useFacetMap();
  const query = useMemo(() => {
    return {
      string: [
        {
          id: value.facetId,
          value: Array.isArray(value.value)
            ? value.value
            : [String(value.value)],
        },
      ],
    };
  }, [value]);
  return (
    <>
      <span>
        Additional query: {data?.[value.facetId]?.name ?? value.facetId}
        {" = "}
        <input
          value={value.value}
          onChange={(e) => {
            onChange({
              ...value,
              value: e.target.value,
            });
          }}
        />
      </span>
      <QueryProvider initialQuery={query} loadFacets={false}>
        <ResultCarousel />
      </QueryProvider>
    </>
  );
};

const GroupEditor = ({
  group: value,
  onChange,
}: {
  group: RelationGroup;
  onChange: (data: RelationGroup) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { data } = useFacetMap();
  const onArrayChange =
    (
      prop: "additionalQueries" | "requiredForItem" | "relations",
      idx: number
    ) =>
    (relation: RelationMatch | Relation) => {
      const newRelations = [...(value[prop] ?? [])];
      newRelations[idx] = relation;
      onChange({
        ...value,
        [prop]: newRelations,
      });
    };

  return (
    <div className="border border-gray-400 p-4 rounded-md">
      <h2 className="flex items-center gap-2">
        <label className="flex flex-col">
          <span>Name</span>
          <input
            value={value.name}
            onChange={(e) => {
              onChange({
                ...value,
                name: e.target.value,
              });
            }}
          />
        </label>
        <Button size="sm" variant="outline" onClick={() => setOpen((p) => !p)}>
          Open
        </Button>
      </h2>
      {open && (
        <div className="flex flex-col gap-2">
          <div>
            <h3>Additional queries</h3>
            {value.additionalQueries?.map((relation, idx) => (
              <div key={`${relation.facetId}-${relation.value}`}>
                <RelationMatchEditor
                  {...relation}
                  onChange={onArrayChange("additionalQueries", idx)}
                />
              </div>
            ))}
          </div>
          <div>
            <h3>Required on item level</h3>
            {value.requiredForItem?.map((relation, idx) => (
              <div key={`${relation.facetId}-${relation.value}`}>
                <RelationMatchEditor
                  {...relation}
                  onChange={onArrayChange("requiredForItem", idx)}
                />
              </div>
            ))}
          </div>
          <ul>
            {value.relations?.map((relation) => (
              <li key={`${relation.fromId}-${relation.toId}`}>
                {data?.[relation.fromId]?.name ?? relation.fromId} -{" "}
                {data?.[relation.toId]?.name ?? relation.toId} -{" "}
                {relation.converter}
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
  const { data: groups, mutate } = useRelationGroups();
  const updateRelationGroups = useRelationGroupsMutation();
  //const [groups, setGroups] = useState(data);
  const onItemChange = (idx: number) => (group: RelationGroup) => {
    const newGroups = [...(groups ?? [])];
    newGroups[idx] = group;
    mutate(newGroups, { revalidate: false });
  };
  return (
    <div className="flex flex-col gap-4">
      {groups?.map((group, idx) => (
        <GroupEditor
          key={getKey(group)}
          group={group}
          onChange={onItemChange(idx)}
        />
      ))}
      <div>
        <Button
          onClick={() => {
            if (groups == null) return;
            updateRelationGroups(groups);
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
};
