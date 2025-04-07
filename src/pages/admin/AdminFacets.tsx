import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Input } from "../../components/ui/input";
import { FacetListItem } from "../../lib/types";
import { useFieldValues } from "../../adminHooks";

const FacetValues = ({ id }: { id: number }) => {
  const { data: values } = useFieldValues(id);
  return (
    <ul>
      {values?.map((value) => (
        <li key={value}>{value}</li>
      ))}
    </ul>
  );
};

export const AdminFacet = (facet: FacetListItem) => {
  const [open, setOpen] = useState(false);
  const isKeyFacet = facet.fieldType === "key";
  return (
    <>
      <div className="grid grid-cols-subgrid col-span-full border-b border-gray-100 p-4">
        <div>
          <button
            className="font-medium bold"
            onClick={() => setOpen((p) => !p)}
          >
            {facet.name} ({isKeyFacet ? "" : "max-min: "}
            {facet.count})
            {isKeyFacet && (
              <>
                {open ? (
                  <ChevronUp className="size-4 inline ml-2" />
                ) : (
                  <ChevronDown className="size-4 inline ml-2" />
                )}
              </>
            )}
          </button>
        </div>
        <span>
          <Input defaultValue={facet.type} />
        </span>
        <span>
          <select value={facet.sort}>
            <option>By number of hits</option>
            <option>Name</option>
          </select>
        </span>
        <Input defaultValue={facet.prio} type="number" />
      </div>
      {isKeyFacet && open && (
        <div className="grid grid-cols-subgrid col-span-full border-b border-gray-100 p-4">
          <FacetValues id={facet.id} />
        </div>
      )}
    </>
  );
};
