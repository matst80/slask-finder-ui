import { useState } from "react";
import { Input } from "../../components/ui/input";
import { FacetListItem } from "../../lib/types";
import { useFieldValues } from "../../adminHooks";

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
              <pre>{JSON.stringify(value, null, 2)}</pre>
            </li>
          )
        )}
      </ul>
    );
  }
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
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
        <span>
          <Input defaultValue={facet.type} />
        </span>
        <span>
          <select value={facet.sort}>
            <option value="">By number of hits</option>
            <option value="name">Name</option>
          </select>
        </span>
        <Input defaultValue={facet.prio} type="number" />
      </div>
      {open && (
        <div className="grid grid-cols-subgrid col-span-full border-b border-gray-100 p-4">
          <FacetValues id={facet.id} />
        </div>
      )}
    </>
  );
};
