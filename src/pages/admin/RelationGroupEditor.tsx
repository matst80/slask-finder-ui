import { useMemo, useState } from "react";
import { useAdminRelationGroups, useFacetMap } from "../../hooks/searchHooks";
import {
  FacetListItem,
  ItemsQuery,
  Relation,
  RelationGroup,
  RelationMatch,
} from "../../lib/types";
import { QueryProvider } from "../../lib/hooks/QueryProvider";
import { ResultCarousel } from "../../components/ItemDetails";
import { Button } from "../../components/ui/button";
import { useFieldValues, useRelationGroupsMutation } from "../../adminHooks";
import { TrashIcon } from "lucide-react";

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
      <select
        multiple={true}
        className="w-full min-h-64 min-w-32"
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions).map(
            (option) => option.value
          );
          onChange(selected);
        }}
      >
        {data
          ?.filter((d) => typeof d === "string")
          .map((text) => (
            <option
              key={text}
              value={text}
              selected={
                Array.isArray(value) ? value.includes(text) : value === text
              }
            >
              {text}
            </option>
          ))}
      </select>
      {/* <input
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
      </datalist> */}
    </>
  );
};

const FacetInput = ({
  id: facetId,
  onChange,
  labelFormatter,
}: {
  id: number;
  onChange: (id: number) => void;
  labelFormatter?: (facet: FacetListItem | undefined) => string;
}) => {
  const { data } = useFacetMap();
  const facet = useMemo(() => {
    return data?.[facetId];
  }, [data, facetId]);
  return (
    <label className="flex flex-col gap-2">
      <span>
        {labelFormatter?.(facet) ?? facet?.name ?? `Loading (${facetId})`}
      </span>
      <input
        value={facetId}
        type="number"
        placeholder="Facet ID"
        list="facetId"
        onChange={(e) => {
          const nr = Number(e.target.value);
          if (!isNaN(nr)) {
            onChange(nr);
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
  );
};

const RelationMatchEditor = ({
  onChange,
  ...value
}: RelationMatch & { onChange: (data: RelationMatch) => void }) => {
  const { facetId } = value;

  return (
    <div className="relative group">
      <div className="flex items-center gap-4">
        <FacetInput
          id={facetId}
          onChange={(id) => {
            onChange({
              ...value,
              facetId: id,
            });
          }}
        />

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
    </div>
  );
};

const RelationEditor = ({
  relation,
  onChange,
}: {
  relation: Relation;
  onChange: (data: Relation) => void;
}) => {
  const { fromId, toId } = relation;

  return (
    <div className="flex items-center gap-4">
      <FacetInput
        id={fromId}
        onChange={(id) => {
          onChange({
            ...relation,
            fromId: id,
          });
        }}
        labelFormatter={(facet) => `From: ${facet?.name ?? fromId}`}
      />
      <FacetInput
        id={toId}
        onChange={(id) => {
          onChange({
            ...relation,
            toId: id,
          });
        }}
        labelFormatter={(facet) => `To: ${facet?.name ?? fromId}`}
      />
      <select
        value={relation.converter}
        onChange={(e) => {
          onChange({
            ...relation,
            converter: e.target.value as Relation["converter"],
          });
        }}
      >
        <option value="none">None</option>
        <option value="valueToMin">ValueToMin</option>
        <option value="valueToMax">ValueToMax</option>
      </select>
    </div>
  );
};

const hasValue = (
  relation: RelationMatch
): relation is Omit<RelationMatch, "value"> & { value: string | string[] } => {
  if (relation.value == null) return false;
  if (Array.isArray(relation.value)) {
    return relation.value.length > 0;
  }
  return true;
};

const QueryPreview = ({ matches }: { matches: RelationMatch[] }) => {
  const query = useMemo<ItemsQuery>(() => {
    return {
      string: matches.filter(hasValue).map((match) => ({
        id: match.facetId,
        value: Array.isArray(match.value) ? match.value : [match.value],
      })),
    };
  }, [matches]);

  return (
    <QueryProvider initialQuery={query} loadFacets={false}>
      <ResultCarousel />
    </QueryProvider>
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
          <div className="p-4 border border-gray-300 rounded-md">
            <h3>Additional queries</h3>
            <div className="flex items-center gap-4">
              {value.additionalQueries?.map((relation, idx) => (
                <div
                  key={`${relation.facetId}-${relation.value}`}
                  className="relative bg-white p-4 border border-gray-300 rounded-md"
                >
                  <RelationMatchEditor
                    {...relation}
                    onChange={onArrayChange("additionalQueries", idx)}
                  />
                  <button
                    className="absolute -top-2 -right-2"
                    onClick={() => {
                      const newRelations = [...(value.additionalQueries ?? [])];
                      newRelations.splice(idx, 1);
                      onChange({
                        ...value,
                        additionalQueries: newRelations,
                      });
                    }}
                  >
                    <TrashIcon className="size-5" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newRelation: RelationMatch = {
                  facetId: 10,
                  value: "!nil",
                };
                const newRelations = [
                  ...(value.additionalQueries ?? []),
                  newRelation,
                ];
                onChange({
                  ...value,
                  additionalQueries: newRelations,
                });
              }}
            >
              Add
            </Button>
            <QueryPreview matches={value.additionalQueries ?? []} />
          </div>
          <div className="p-4 border border-gray-300 rounded-md">
            <h3>Required on item level</h3>
            <div className="flex items-center gap-4">
              {value.requiredForItem?.map((relation, idx) => (
                <div
                  key={`${relation.facetId}-${relation.value}`}
                  className="relative bg-white p-4 border border-gray-300 rounded-md"
                >
                  <RelationMatchEditor
                    {...relation}
                    onChange={onArrayChange("requiredForItem", idx)}
                  />
                  <button
                    className="absolute -top-2 -right-2"
                    onClick={() => {
                      const newRelations = [...(value.additionalQueries ?? [])];
                      newRelations.splice(idx, 1);
                      onChange({
                        ...value,
                        additionalQueries: newRelations,
                      });
                    }}
                  >
                    <TrashIcon className="size-5" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newRelation: RelationMatch = {
                  facetId: 10,
                  value: "!nil",
                };
                const newRelations = [
                  ...(value.requiredForItem ?? []),
                  newRelation,
                ];
                onChange({
                  ...value,
                  requiredForItem: newRelations,
                });
              }}
            >
              Add
            </Button>
            <QueryPreview matches={value.requiredForItem ?? []} />
          </div>
          <div className="p-4 border border-gray-300 rounded-md">
            <h3>Relations</h3>
            <div className="flex items-center gap-4">
              {value.relations?.map((relation, idx) => (
                <div
                  key={`${relation.fromId}-${relation.toId}`}
                  className="relative bg-white p-4 border border-gray-300 rounded-md"
                >
                  <RelationEditor
                    relation={relation}
                    onChange={onArrayChange("relations", idx)}
                  />
                  <button
                    className="absolute -top-2 -right-2"
                    onClick={() => {
                      const newRelations = [...(value.relations ?? [])];
                      newRelations.splice(0, 1);
                      onChange({
                        ...value,
                        relations: newRelations,
                      });
                    }}
                  >
                    <TrashIcon className="size-5" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newRelation: Relation = {
                  fromId: 10,
                  toId: 20,
                  converter: "none",
                };
                const newRelations = [...(value.relations ?? []), newRelation];
                onChange({
                  ...value,
                  relations: newRelations,
                });
              }}
            >
              Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const RelationGroupEditor = () => {
  const { data: groups, mutate } = useAdminRelationGroups();
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

            mutate(
              [
                ...groups,
                {
                  name: "New group",
                  key: `new-${groups.length}`,
                  groupId: groups.length + 1,
                  additionalQueries: [],
                  relations: [],
                  requiredForItem: [],
                },
              ],
              { revalidate: false }
            );
          }}
          variant="outline"
        >
          Add
        </Button>
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
