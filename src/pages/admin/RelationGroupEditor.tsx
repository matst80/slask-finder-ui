import { useMemo, useState } from "react";
import { useFacetMap, useRelationGroups } from "../../hooks/searchHooks";
import { Relation, RelationGroup, RelationMatch } from "../../lib/types";
import { QueryProvider } from "../../lib/hooks/QueryProvider";
import { ResultCarousel } from "../../components/ItemDetails";
import { Button } from "../../components/ui/button";
import { useFieldValues, useRelationGroupsMutation } from "../../adminHooks";

const FacetValueInput = ({
  value,
  facetId,
  onChange,
}: {
  value: string | number | string[] | undefined;
  facetId: number;
  onChange: (data: string | number | string[] | undefined) => void;
}) => {
  const { data } = useFieldValues(facetId);

  return (
    <>
      <input
        value={value}
        list="fieldValues"
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
      <datalist id="fieldValues">
        {data
          ?.filter((d) => typeof d === "string")
          .map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
      </datalist>
    </>
  );
};

const RelationMatchEditor = ({
  onChange,
  ...value
}: RelationMatch & { onChange: (data: RelationMatch) => void }) => {
  const { data } = useFacetMap();
  const { facetId } = value;
  const fieldName = useMemo(() => {
    return data?.[facetId]?.name ?? `Loading (${facetId})`;
  }, [data, facetId]);
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
      <div className="flex items-center gap-2">
        <label className="flex flex-col">
          Additional query: {fieldName}
          <input
            value={facetId}
            type="number"
            placeholder="Facet ID"
            list="facetId"
            onChange={(e) => {
              const nr = Number(e.target.value);
              if (!isNaN(nr)) {
                onChange({
                  ...value,
                  facetId: nr,
                });
              }
            }}
          />
          <datalist id="facetId">
            {Object.entries(data ?? {}).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </datalist>
        </label>
        <label className="flex flex-col">
          <span>Value</span>
          <FacetValueInput
            value={value.value}
            facetId={facetId}
            onChange={(v) => {
              onChange({
                ...value,
                value: v,
              });
            }}
          />
        </label>
      </div>
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
          key={group.key}
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
