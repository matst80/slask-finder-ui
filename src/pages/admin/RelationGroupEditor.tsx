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
import { Delete, TrashIcon } from "lucide-react";
import fuzzysort from "fuzzysort";
import { Input } from "../../components/ui/input";
import { TotalResultText } from "../../components/ResultHeader";

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
  const [filter, setFilter] = useState("");

  const filteredData = useMemo(() => {
    const keyData = data?.filter((d) => typeof d === "string").sort() ?? [];
    const selected = keyData?.filter((v) =>
      Array.isArray(value) ? value.includes(v) : value === v
    );
    if (filter === "" && selected?.length > 0) {
      return selected;
    }
    const filtered = fuzzysort.go(filter, keyData, {
      limit: 20,
      all: filter.length < 1,
      threshold: 0.4,
    });
    return [...selected, ...filtered.map((f) => f.target)];
  }, [data, filter, value]);
  return (
    <div className="relative group">
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter values"
      />
      <select
        multiple={true}
        className="hidden group-hover:flex absolute w-[300px] bg-white border border-gray-300 rounded-md overflow-auto flex-col z-10"
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions).map(
            (option) => option.value
          );
          onChange(selected);
        }}
      >
        {filteredData.map((text) => (
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
    </div>
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
  const [filter, setFilter] = useState("");
  const facet = useMemo(() => {
    return data?.[facetId];
  }, [data, facetId]);
  const filteredData = useMemo(() => {
    return fuzzysort.go(filter, Object.values(data ?? {}), {
      key: "name",
      limit: 20,
      threshold: 0.4,
    });
  }, [data, filter]);
  return (
    <label className="flex flex-col">
      <span>
        {labelFormatter?.(facet) ?? facet?.name ?? `Loading (${facetId})`}
      </span>
      <div>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter facets"
        />
        {filteredData.length > 0 && (
          <div className="absolute w-[300px] h-[400px] bg-white border border-gray-300 rounded-md overflow-auto flex flex-col z-10">
            {filteredData.map((facet) => (
              <button
                key={facet.obj.id}
                onClick={() => onChange(facet.obj.id)}
                className="text-left border-b border-gray-200 p-2 hover:bg-gray-100"
              >
                {facet.target}
              </button>
            ))}
          </div>
        )}
      </div>
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
          <span>
            Value{" "}
            {value.value != null
              ? Array.isArray(value.value)
                ? value.value.join(", ")
                : String(value)
              : ""}
          </span>
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
  const [open, setOpen] = useState(false);
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
      <div onClick={() => setOpen((p) => !p)} className="cursor-pointer">
        <TotalResultText className="font-bold" />
        {open && <ResultCarousel />}
      </div>
    </QueryProvider>
  );
};

const DeleteButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      className="absolute -top-2 -right-2 bg-white p-2 rounded-md"
      onClick={onClick}
    >
      <TrashIcon className="size-5" />
    </button>
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
      <h2 className="flex items-center justify-between gap-2">
        <label className="flex flex-col">
          <span>Name</span>
          <Input
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
        <div className="flex flex-col mt-2 gap-4">
          <div className="p-4 border bg-yellow-100 rounded-md">
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
                  <DeleteButton
                    onClick={() => {
                      onChange({
                        ...value,
                        additionalQueries:
                          value.additionalQueries?.filter(
                            (d) => d.facetId !== relation.facetId
                          ) ?? [],
                      });
                    }}
                  />
                </div>
              ))}
              <button
                className="relative bg-white p-4 border border-gray-300 rounded-md flex"
                onClick={() => {
                  onChange({
                    ...value,
                    additionalQueries: [
                      ...(value.additionalQueries ?? []),
                      {
                        facetId: 10,
                        value: ["!nil"],
                      },
                    ],
                  });
                }}
              >
                Add
              </button>
            </div>

            <QueryPreview matches={value.additionalQueries ?? []} />
          </div>
          <div className="p-4 border bg-pink-100 rounded-md">
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
                  <DeleteButton
                    onClick={() => {
                      onChange({
                        ...value,
                        requiredForItem: value.requiredForItem.filter(
                          (d) => d.facetId != relation.facetId
                        ),
                      });
                    }}
                  />
                </div>
              ))}
              <button
                className="relative bg-white p-4 border border-gray-300 rounded-md flex"
                onClick={() => {
                  onChange({
                    ...value,
                    requiredForItem: [
                      ...(value.requiredForItem ?? []),
                      {
                        facetId: 10,
                        value: ["!nil"],
                      },
                    ],
                  });
                }}
              >
                Add
              </button>
            </div>

            <QueryPreview matches={value.requiredForItem ?? []} />
          </div>
          <div className="p-4 border bg-green-100 rounded-md">
            <h3>Relations</h3>
            <div className="flex gap-4">
              {value.relations?.map((relation, idx) => (
                <div
                  key={`${relation.fromId}-${relation.toId}`}
                  className="relative bg-white p-4 border border-gray-300 rounded-md"
                >
                  <RelationEditor
                    relation={relation}
                    onChange={onArrayChange("relations", idx)}
                  />
                  <DeleteButton
                    onClick={() => {
                      onChange({
                        ...value,
                        relations: value.relations.filter((_, i) => i !== idx),
                      });
                    }}
                  />
                </div>
              ))}
              <button
                className="relative bg-white p-4 border border-gray-300 rounded-md flex"
                onClick={() => {
                  onChange({
                    ...value,
                    relations: [
                      ...(value.relations ?? []),
                      {
                        fromId: 10,
                        toId: 20,
                        converter: "none",
                      },
                    ],
                  });
                }}
              >
                Add
              </button>
            </div>
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
