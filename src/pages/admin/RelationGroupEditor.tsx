import { useEffect, useMemo, useRef, useState } from "react";
import { useAdminRelationGroups, useFacetMap } from "../../hooks/searchHooks";
import {
  FacetListItem,
  Relation,
  RelationGroup,
  RelationMatch,
} from "../../lib/types";
import { Button } from "../../components/ui/button";
import { useFieldValues, useRelationGroupsMutation } from "../../adminHooks";
import { PlusIcon, TrashIcon, ChevronUp } from "lucide-react";
import fuzzysort from "fuzzysort";
import { Input } from "../../components/ui/input";
import { QueryPreview } from "../../components/QueryPreview";
import { cm } from "../../utils";

const useClickOutside = (fn: () => void) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        fn();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [fn]);
  return ref;
};

const FacetValueTagEditor = ({
  data,
  facetId,
  onChange,
}: {
  facetId: number;
  data: string[];
  onChange: (data: string[]) => void;
}) => {
  const { data: facetValues } = useFieldValues(facetId);
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<string[]>(data);
  const [value, setValue] = useState<string>("");
  const ref = useClickOutside(() => {
    setOpen(false);
  });

  const filteredData = useMemo(() => {
    const keyData =
      facetValues?.filter((d) => typeof d === "string").sort() ?? [];

    const filtered = fuzzysort.go(value, keyData, {
      limit: 20,
      all: value.length < 1,
      threshold: 0.4,
    });
    return [...filtered.map((f) => f.target)];
  }, [facetValues, value]);

  useEffect(() => {
    setOpen(false);
  }, [tags]);

  useEffect(() => {
    if (tags !== data) {
      onChange(tags);
    }
  }, [tags]);

  return (
    <div className="flex gap-2">
      {tags.map((tag, idx) => (
        <div
          key={idx}
          className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full flex items-center gap-2"
        >
          <span>{tag}</span>
          <button
            onClick={() => {
              setTags((prev) => prev.filter((_, i) => i !== idx));
            }}
            className="text-red-500 hover:text-red-700"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
      ))}
      <div ref={ref} className="relative">
        <input
          type="text"
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a tag"
          className="border border-gray-300 rounded-md px-2 py-1 peer"
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim() !== "") {
              setTags((prev) => [...prev, value]);
              setValue("");
            }
          }}
        />
        {filteredData.length > 0 && (
          <div
            className={cm(
              open ? "flex" : "hidden",
              "absolute w-full mt-1 bg-white border border-gray-200 rounded-xs shadow-lg overflow-auto flex-col z-10 max-h-60"
            )}
          >
            {filteredData.map((text) => (
              <button
                key={text}
                onClick={() => {
                  setTags((prev) => [...prev, text]);
                  setValue("");
                }}
                className="text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                {text}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => {
          if (value.trim() !== "") {
            setTags((prev) => [...prev, value]);
            setValue("");
          }
        }}
        className="bg-blue-500 text-white px-2 py-1 rounded-md"
      >
        Add
      </button>
    </div>
  );
};

const FacetValueInput = ({
  value,
  facetId,
  onChange,
}: {
  value: string | number | string[] | undefined;
  facetId: number;
  onChange: (data: string | number | string[] | undefined) => void;
}) => {
  const { data: facetValues } = useFieldValues(facetId);

  const [filter, setFilter] = useState("");

  const filteredData = useMemo(() => {
    const keyData =
      facetValues?.filter((d) => typeof d === "string").sort() ?? [];
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
  }, [facetValues, filter, value]);

  return (
    <div className="relative group">
      <Input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter values"
        className="w-full"
      />
      <select
        multiple={true}
        className="hidden group-hover:flex absolute w-full mt-1 bg-white border border-gray-200 rounded-xs shadow-lg overflow-auto flex-col z-10 max-h-60"
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
            className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
          >
            {text}
          </option>
        ))}
      </select>
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
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">
        {labelFormatter?.(facet) ?? facet?.name ?? `Loading (${facetId})`}
      </span>
      <div className="relative">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter facets"
          className="w-full"
        />
        {filteredData.length > 0 && (
          <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-xs shadow-lg overflow-auto flex flex-col z-10 max-h-60">
            {filteredData.map((facet) => (
              <button
                key={facet.obj.id}
                onClick={() => onChange(facet.obj.id)}
                className="text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
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
  const { facetId, value: toMatch, exclude } = value;

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-xs border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FacetInput
          id={facetId}
          onChange={(id) => {
            onChange({
              ...value,
              facetId: id,
            });
          }}
        />

        <label className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Value{" "}
              {toMatch != null
                ? Array.isArray(toMatch)
                  ? toMatch.join(", ")
                  : String(toMatch)
                : ""}
            </span>
            <label className="text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={exclude}
                onChange={(e) => {
                  console.log("exclude", e.target.checked);
                  onChange({
                    ...value,
                    exclude: e.target.checked,
                  });
                }}
              />
              <span className="ml-2">Exclude</span>
            </label>
          </div>

          {Array.isArray(toMatch) || typeof toMatch === "string" ? (
            <FacetValueTagEditor
              data={Array.isArray(toMatch) ? toMatch : [toMatch]}
              facetId={facetId}
              onChange={(v) => {
                onChange({
                  ...value,
                  value: v,
                });
              }}
            />
          ) : (
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
          )}

          {/* <FacetValueInput
            value={value.value}
            facetId={facetId}
            onChange={(v) => {
              onChange({
                ...value,
                value: v,
              });
            }}
          /> */}
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
    <div className="flex flex-col gap-4 p-4 bg-white rounded-xs border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Converter</label>
          <select
            value={relation.converter}
            onChange={(e) => {
              onChange({
                ...relation,
                converter: e.target.value as Relation["converter"],
              });
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-xs text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="none">None</option>
            <option value="valueToMin">ValueToMin</option>
            <option value="valueToMax">ValueToMax</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const DeleteButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      className="absolute -top-2 -right-2 bg-white p-1.5 rounded-full border border-gray-200 shadow-xs hover:bg-gray-50"
      onClick={onClick}
    >
      <TrashIcon className="size-4 text-gray-500" />
    </button>
  );
};

const AddButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      className="relative bg-white p-4 border border-gray-200 rounded-xs flex justify-center items-center hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <PlusIcon className="size-5 text-gray-500" />
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
      onChange({
        ...value,
        [prop]: value[prop]?.map((d, i) => {
          if (i === idx) {
            return relation;
          }
          return d;
        }),
      });
    };

  return (
    <div className="border border-gray-200 rounded-xs bg-gray-50">
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex-1">
          <h2 className="text-lg font-medium text-gray-900">{value.name}</h2>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setOpen((p) => !p)}
          className="flex items-center gap-2"
        >
          {open ? (
            <>
              <ChevronUp className="size-4" />
              <span>Close</span>
            </>
          ) : (
            <>
              <span>Edit</span>
            </>
          )}
        </Button>
      </div>
      {open && (
        <div className="p-4 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <Input
                value={value.name}
                onChange={(e) => {
                  onChange({
                    ...value,
                    name: e.target.value,
                  });
                }}
                placeholder="Group name"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">
              Required on item level
            </h3>
            <div className="w-full">
              <div className="flex flex-col gap-4">
                {value.requiredForItem?.map((relation, idx) => (
                  <div
                    key={`${relation.facetId}-${relation.value}`}
                    className="relative"
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
                <AddButton
                  onClick={() => {
                    onChange({
                      ...value,
                      requiredForItem: [
                        ...(value.requiredForItem ?? []),
                        {
                          facetId: 10,
                          value: [""],
                        },
                      ],
                    });
                  }}
                />
              </div>
            </div>
            <QueryPreview matches={value.requiredForItem ?? []} />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">
              Additional queries
            </h3>
            <div className="w-full ">
              <div className="flex flex-col gap-4">
                {value.additionalQueries?.map((relation, idx) => (
                  <div
                    key={`${relation.facetId}-${relation.value}`}
                    className="relative"
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
                <AddButton
                  onClick={() => {
                    onChange({
                      ...value,
                      additionalQueries: [
                        ...(value.additionalQueries ?? []),
                        {
                          facetId: 10,
                          exclude: false,
                          value: [""],
                        },
                      ],
                    });
                  }}
                />
              </div>
            </div>
            <QueryPreview matches={value.additionalQueries ?? []} />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Relations</h3>
            <div className="space-y-4">
              {value.relations?.map((relation, idx) => (
                <div
                  key={`${relation.fromId}-${relation.toId}`}
                  className="relative"
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
              <AddButton
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
              />
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

  const onItemChange = (idx: number) => (group: RelationGroup) => {
    const newGroups = [...(groups ?? [])];
    newGroups[idx] = group;
    mutate(newGroups, { revalidate: false });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Relation Groups</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              if (groups == null) return;
              updateRelationGroups(groups);
            }}
          >
            Save Changes
          </Button>
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
            Add Group
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {groups?.map((group, idx) => (
          <GroupEditor
            key={group.key}
            group={group}
            onChange={onItemChange(idx)}
          />
        ))}
      </div>
    </div>
  );
};
