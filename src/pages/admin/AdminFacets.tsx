import { useState } from "react";
import { Input } from "../../components/ui/input";
import { FacetListItem } from "../../lib/types";
import { useFieldValues, useUpdateFacet } from "../../adminHooks";
import { Button } from "../../components/ui/button";

const FacetValues = ({ id }: { id: number }) => {
  const { data } = useFieldValues(id);

  if (Array.isArray(data)) {
    return (
      <ul>
        {data?.map((value, idx) =>
          typeof value === "string" ? (
            <li key={value}>{value}</li>
          ) : (
            <li key={idx}>
              Min: {value.min} Max: {value.max}
            </li>
          )
        )}
      </ul>
    );
  }
  return null;
};

const FacetEditor = ({ data }: { data: FacetListItem }) => {
  const [value, setValue] = useState(data);
  const saveFacet = useUpdateFacet();
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 p-4">
        <div>
          <Input
            value={value.name ?? ""}
            onChange={(e) =>
              setValue((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Name"
          />
        </div>
        <div>
          <Input
            value={value.type ?? ""}
            onChange={(e) =>
              setValue((prev) => ({ ...prev, type: e.target.value }))
            }
            placeholder="Type"
          />
        </div>
        <div>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="0">By hits</option>
            <option value="1">By name</option>
          </select>{" "}
        </div>
        <div>
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
        </div>
        <div>
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
        <div>
          <button
            className="font-medium bold"
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
        <span>{facet.type ? facet.type : ""}</span>
        <span>{facet.sort ? facet.sort : ""}</span>
        <span>{facet.prio}</span>

        {/* <span>{facet.searchable}</span> */}
      </div>

      {open && (
        <div className="flex flex-col p-4 col-span-full">
          <FacetEditor data={facet} />
          <FacetValues id={facet.id} />
        </div>
      )}
    </>
  );
};
