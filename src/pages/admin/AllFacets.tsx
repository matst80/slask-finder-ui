import { useMemo, useState } from "react";
import {
  useAdminFacets,
  useDeleteFacet,
  useFieldValues,
  useUpdateFacet,
} from "../../adminHooks";
import fuzzysort from "fuzzysort";
import { byPriority } from "../../utils";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  FilterIcon,
  SearchIcon,
  ChevronDown,
  ChevronUp,
  XIcon,
  EyeOffIcon,
} from "lucide-react";
import { useQuery } from "../../lib/hooks/useQuery";
import { FacetListItem } from "../../lib/types";

type KeyValues =
  | [true, Fuzzysort.Results]
  | [false, { min: number; max: number }];

const FacetValues = ({ id }: { id: number }) => {
  const { setQuery } = useQuery();
  const { data } = useFieldValues(id);
  const [filter, setFilter] = useState<string>("");

  const [isKeyValues, values] = useMemo<KeyValues>(() => {
    if (!data) return [false, { min: 0, max: 0 }];
    const isKeys = typeof data[0] === "string";
    if (!isKeys) {
      return [false, data[0] as { min: number; max: number }];
    }
    const keyValues = data.filter((d): d is string => typeof d === "string");
    const filtered = fuzzysort.go(filter, keyValues, {
      limit: 50,
      threshold: 0.5,
      all: filter.length == 0,
    });
    return [true, filtered];
  }, [data, filter]);

  if (!data) {
    return <div>Loading...</div>;
  }

  if (!isKeyValues) {
    if (values== null) {
      return <div>No values</div>;
    }
    const numericValues = values as { min: number; max: number };
    return (
      <div className="bg-slate-100 p-4 rounded-md">
        {values== null ? (
          <div className="text-sm text-gray-500">No values</div>
        ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-bold">Min:</span> {numericValues.min ?? 0}
          </div>
          <div>
            <span className="font-bold">Max:</span> {numericValues.max ?? 0}
          </div>
        </div>
        )}
      </div>
    );
  }

  const keyValues = values as Fuzzysort.Results;
  return (
    <div className="bg-slate-100 p-4 rounded-md flex flex-col gap-2">
      <Input
        placeholder="Filter values..."
        onChange={(e) => setFilter(e.target.value)}
        value={filter}
        className="w-full"
      />
      <ul className="max-h-60 overflow-auto">
        {keyValues.map(({ target: value }) => (
          <li
            key={value}
            className="flex items-center justify-between gap-2 border-b border-gray-300 py-2"
          >
            <span className="font-medium">{value}</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-slate-200"
              >
                <FilterIcon className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-slate-200"
                onClick={() => {
                  setQuery({
                    page: 0,
                    string: [{ id, value: [value] }],
                    range: [],
                  });
                }}
              >
                <SearchIcon className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="text-sm text-gray-500">
        Showing {keyValues.length} of {data.length} values
      </div>
    </div>
  );
};

type ConfirmButtonProps = {
  onConfirm: () => void;
  title?: string;
};

const ConfirmButton = ({ onConfirm, title }: ConfirmButtonProps) => {
  const [confirm, setConfirm] = useState(false);

  if (!confirm)
    return (
      <Button variant="outline" onClick={() => setConfirm(true)}>
        <XIcon className="size-5" />
      </Button>
    );
  return (
    <Button title={title} variant="outline" onClick={onConfirm}>
      Confirm
    </Button>
  );
};

const FacetEditor = ({ data }: { data: FacetListItem }) => {
  const [value, setValue] = useState<FacetListItem>(data);
  const saveFacet = useUpdateFacet();
  const deleteFacet = useDeleteFacet();

  return (
    <div className="p-4 rounded-md ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <Input
            value={value.name ?? ""}
            onChange={(e) =>
              setValue((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Name"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Value type
          </label>
          <Input
            value={value.valueType ?? ""}
            onChange={(e) =>
              setValue((prev) => ({ ...prev, valueType: e.target.value }))
            }
            placeholder="Type"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Linked to
          </label>
          <Input
            value={value.linkedId ?? "0"}
            type="number"
            onChange={(e) => {
              const nr = Number(e.target.value);
              if (!isNaN(nr)) {
                setValue((prev) => ({ ...prev, linkedId: nr }));
              }
            }}
            placeholder="Linked ID"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
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
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category level
          </label>
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
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group id
          </label>
          <Input
            value={value.groupId ?? "0"}
            type="number"
            onChange={(e) => {
              const nr = Number(e.target.value);
              if (!isNaN(nr)) {
                setValue((prev) => ({ ...prev, groupId: nr }));
              }
            }}
            placeholder="Category level"
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.searchable}
              onChange={(e) =>
                setValue((prev) => ({ ...prev, searchable: e.target.checked }))
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Searchable
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.hide}
              onChange={(e) =>
                setValue((prev) => ({ ...prev, hide: e.target.checked }))
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Hide facet
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.isKey}
              onChange={(e) =>
                setValue((prev) => ({ ...prev, isKey: e.target.checked }))
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Key facet
            </span>
          </label>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={() => saveFacet(value)}>Save Changes</Button>
        <ConfirmButton
          onConfirm={() => deleteFacet({ id: value.id })}
          title="Delete facet"
        />
      </div>
    </div>
  );
};

const FacetItem = ({ data }: { data: FacetListItem }) => {
  const { id, name, valueType, prio } = data;
  const [open, setOpen] = useState(false);

  return (
    <div key={id} className="bg-white rounded-sm shadow-sm hover:bg-gray-50">
      <div
        className="flex items-center justify-between p-4 cursor-pointer "
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{name}</span>
            <span className="text-sm text-gray-500">(ID: {id})</span>
            {valueType != null && (
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {valueType}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">Priority: {prio}</div>
        </div>
        <div className="flex items-center gap-2">
          {data.searchable && <SearchIcon className="size-5 text-gray-500" />}
          {data.hide && <EyeOffIcon className="size-5 text-gray-500" />}
          {open ? (
            <ChevronUp className="size-5 text-gray-500" />
          ) : (
            <ChevronDown className="size-5 text-gray-500" />
          )}
        </div>
      </div>
      {open && (
        <div className="border-t bg-white border-gray-200 p-4 space-y-4">
          <FacetEditor data={data} />
          <FacetValues id={id} />
        </div>
      )}
    </div>
  );
};

export const AllFacets = () => {
  const [filter, setFilter] = useState<string>("");
  const { data } = useAdminFacets();

  const filteredData = useMemo(() => {
    return fuzzysort.go(filter, data?.sort(byPriority) ?? [], {
      keys: ["name", "valueType"],
      all: filter.length == 0,
      limit: 50,
    });
  }, [filter, data]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Facets</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage all facets in the search engine. You can edit, remove,
          or view facet values.
        </p>
      </div>
      <div className="flex gap-4 items-center">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1"
          placeholder="Search facets by name or type..."
        />
        <div className="text-sm text-gray-500">
          {filteredData?.length ?? 0} of {data?.length ?? 0} facets
        </div>
      </div>
      <div className="space-y-2">
        {filteredData?.map(({ obj }) => (
          <FacetItem key={obj.id} data={obj} />
        ))}
      </div>
    </div>
  );
};
