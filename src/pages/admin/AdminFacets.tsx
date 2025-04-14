import { useMemo, useState } from "react";
import { Input } from "../../components/ui/input";
import { FacetListItem } from "../../lib/types";
import { useFieldValues, useUpdateFacet } from "../../adminHooks";
import { Button, ButtonLink } from "../../components/ui/button";
import { useQuery } from "../../lib/hooks/QueryProvider";

type KeyValues = [true, string[]] | [false, { min: number; max: number }];

const FacetValues = ({ id }: { id: number }) => {
  const { setQuery } = useQuery();
  const { data } = useFieldValues(id);
  const [filter, setFilter] = useState<string>("");

  const [isKeyValues, values] = useMemo<KeyValues>(() => {
    if (!data) return [true, []];
    const isKeys = typeof data[0] === "string";
    if (!isKeys) {
      return [false, data[0] as { min: number; max: number }];
    }
    return [
      true,
      data
        .filter((d): d is string => {
          if (typeof d !== "string") return false;
          if (!filter.length) return true;
          return d.toLowerCase()?.includes(filter.toLowerCase());
        })
        .sort((a, b) => a.localeCompare(b)),
    ];
  }, [data, filter]);
  if (!isKeyValues) {
    return (
      <div>
        Min: {values.min} Max: {values.max}
      </div>
    );
  }

  return (
    <div className="bg-slate-200 p-4 rounded-md flex flex-col gap-2">
      <Input
        placeholder="Filter..."
        onChange={(e) => setFilter(e.target.value)}
        value={filter}
      />
      <ul>
        {values.map((value) => (
          <li key={value} className="flex items-center gap-2">
            <span className="font-bold">{value}</span>
            <Button variant="ghost" size="sm">
              Find compatible
            </Button>
            <ButtonLink
              to="/"
              onClick={() => {
                setQuery({
                  page: 0,
                  string: [{ id, value: [value] }],
                  range: [],
                });
              }}
              variant="ghost"
              size="sm"
            >
              Find products
            </ButtonLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

const FacetEditor = ({ data }: { data: FacetListItem }) => {
  const [value, setValue] = useState(data);
  const saveFacet = useUpdateFacet();
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 p-4">
        <div>
          <label>
            <span>Name</span>
            <Input
              value={value.name ?? ""}
              onChange={(e) =>
                setValue((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Name"
            />
          </label>
        </div>
        <div>
          <label>
            <span>Value type</span>
            <Input
              value={value.valueType ?? ""}
              onChange={(e) =>
                setValue((prev) => ({ ...prev, valueType: e.target.value }))
              }
              placeholder="Type"
            />
          </label>
        </div>
        <div>
          <label>
            <span>Linked to:</span>
            <Input
              value={value.linkedId ?? "0"}
              type="number"
              onChange={(e) => {
                const nr = Number(e.target.value);
                if (!isNaN(nr)) {
                  setValue((prev) => ({ ...prev, linkedId: nr }));
                }
              }}
              placeholder="Type"
            />
          </label>
        </div>
        <div>
          <label>
            <span>Value sorting</span>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="0">By hits</option>
              <option value="1">By name</option>
              <option value="1">By popularity</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            <span>Priority</span>
            <Input
              value={value.prio ?? "0"}
              type="number"
              onChange={(e) => {
                const nr = Number(e.target.value);
                if (!isNaN(nr)) {
                  setValue((prev) => ({ ...prev, prio: nr }));
                }
              }}
              placeholder="Priority"
            />
          </label>
        </div>
        <div>
          <label>
            <span>Category level</span>
            <Input
              value={value.categoryLevel ?? "0"}
              type="number"
              onChange={(e) => {
                const nr = Number(e.target.value);
                if (!isNaN(nr)) {
                  setValue((prev) => ({ ...prev, categoryLevel: nr }));
                }
              }}
              placeholder="Category level"
            />
          </label>
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.searchable}
              onChange={(e) =>
                setValue((prev) => ({ ...prev, searchable: e.target.checked }))
              }
            />
            Searchable
          </label>
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.hide}
              onChange={(e) =>
                setValue((prev) => ({ ...prev, hide: e.target.checked }))
              }
            />
            Hide facet
          </label>
        </div>
      </div>
      <Button onClick={() => saveFacet(value)}>Save</Button>
    </div>
  );
};

export const AdminFacet = (facet: FacetListItem) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="grid grid-cols-subgrid col-span-full border-b border-gray-100 p-4">
        <div>{facet.id}</div>
        <div>
          <button
            className="font-medium bold text-left line-clamp-1 overflow-ellipsis"
            onClick={() => setOpen((p) => !p)}
          >
            {facet.name}
            {facet.count}
            {/* {isKeyFacet && (
              <>
                {open ? (
                  <ChevronUp className="size-4 inline ml-2" />
                ) : (
                  <ChevronDown className="size-4 inline ml-2" />
                )}
              </>
            )} */}
          </button>
        </div>
        <span>{facet.valueType ? facet.valueType : ""}</span>
        <span>{facet.sort ? facet.sort : ""}</span>
        <span>{facet.prio}</span>

        {/* <span>{facet.searchable}</span> */}
      </div>

      {open && (
        <div className="flex flex-col p-4 gap-4 col-span-full">
          <FacetEditor data={facet} />
          <FacetValues id={facet.id} />
        </div>
      )}
    </>
  );
};
