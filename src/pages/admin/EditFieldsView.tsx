import { useMemo, useState } from "react";
import {
  useAdminFacets,
  useCleanFields,
  useFields,
  useMissingFacets,
} from "../../adminHooks";
import { Button } from "../../components/ui/button";
import { createFacetFromField, deleteFacet } from "../../lib/datalayer/api";
import { cm } from "../../utils";
import { FieldListItem } from "../../lib/types";
import { TimeAgo } from "../../components/TimeAgo";
import { LoaderCircle } from "lucide-react";

const byCount = (a: FieldListItem, b: FieldListItem) => {
  return (b.itemCount ?? 0) - (a.itemCount ?? 0);
};

const CleanFieldsButton = () => {
  const { cleanFields, isLoading, error } = useCleanFields();
  console.log({ error, isLoading });
  return (
    <>
      {error && <span>fel:{JSON.stringify(error, null, 2)}</span>}
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          cleanFields;
        }}
      >
        {isLoading ? (
          <LoaderCircle className="size-5 animate-spin inline-block ml-2" />
        ) : (
          <span>Clean Fields</span>
        )}
      </Button>
    </>
  );
};

const FilteredFieldView = ({
  data,
}: {
  data: (FieldListItem & { key: string })[];
}) => {
  const [filter, setFilter] = useState<string>("");
  const { data: facets = [] } = useAdminFacets();
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const uniquePurpose = useMemo(() => {
    const purposeSet = new Set<string>();
    data.forEach((field) => {
      field.purpose?.forEach((purpose) => {
        purposeSet.add(purpose);
      });
    });
    return Array.from(purposeSet);
  }, [data]);
  const filteredData = useMemo(() => {
    return data
      .filter((field) => {
        if (
          selectedPurpose != null &&
          !field.purpose?.includes(selectedPurpose)
        )
          return false;
        if (!filter.length) return selectedPurpose != null;
        if (field.key?.includes(filter) || field.key == filter) return true;
        return field.name.toLowerCase()?.includes(filter.toLowerCase());
      })
      .map((field) => {
        const isFacet = facets.some((f) => f.id == field.id);
        return {
          ...field,
          isFacet,
        };
      })
      .sort(byCount);
  }, [filter, data, selectedPurpose, facets]);
  const addField = (fieldKey: string) => {
    createFacetFromField(fieldKey);
  };
  const removeFacet = (facetId: number) => {
    if (confirm("Are you sure you want to remove this facet?")) {
      deleteFacet(facetId);
    }
  };
  console.log(filteredData);
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">Edit Fields</h1>
      <p className="text-sm">
        Edit the fields that are used in the search engine. You can add, remove,
        or edit fields.
      </p>
      <div className="my-4">
        <span className="flex gap-2">
          {uniquePurpose?.map((str) => (
            <button
              key={str}
              onClick={() => {
                if (selectedPurpose === str) {
                  setSelectedPurpose(null);
                } else {
                  setSelectedPurpose(str);
                }
              }}
              className={cm(
                "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-blue-800 cursor-pointer",
                selectedPurpose === str ? "bg-white" : "bg-blue-100"
              )}
            >
              {str}
            </button>
          ))}
        </span>
      </div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="border border-gray-300 rounded-md p-2"
        placeholder="Search fields..."
      />
      <ul>
        {filteredData?.map((field) => (
          <li
            key={field.id}
            className="flex items-center justify-between border-b border-gray-300 pb-1 mb-1"
          >
            <div className="flex flex-col">
              <div>
                <span title={field.key} className="text-sm font-bold">
                  {field.name}
                </span>
                <span className="text-sm"> ({field.itemCount ?? "0"}st)</span>
              </div>
              <span className="text-sm">{field.description}</span>
            </div>

            <div className="flex gap-3 items-center">
              {field.lastSeen != null && field.lastSeen > 0 && (
                <span className="text-xs bg-yellow-200 rounded-md px-2 py-1">
                  <span>Last update: </span>
                  <TimeAgo ts={field.lastSeen} />
                </span>
              )}

              <span className="flex gap-2">
                {field.purpose?.map((str) => (
                  <span
                    key={str}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {str}
                  </span>
                ))}
              </span>
              {field.isFacet ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeFacet(field.id)}
                >
                  Remove
                </Button>
              ) : (
                <Button size="sm" onClick={() => addField(field.key)}>
                  Add
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div>
        <span>
          {filteredData.length} / {Object.keys(data ?? {}).length}
        </span>
      </div>
      <div>
        <CleanFieldsButton />
      </div>
    </div>
  );
};

export const EditFieldsView = () => {
  const { data, isLoading } = useFields();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return <FilteredFieldView data={data ?? []} />;
};

export const MissingFieldsView = () => {
  const { data, isLoading } = useMissingFacets();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return <FilteredFieldView data={data ?? []} />;
};
