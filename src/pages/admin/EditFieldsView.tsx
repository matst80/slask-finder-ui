import { useMemo, useState } from "react";
import { useFields } from "../../adminHooks";
import { Button } from "../../components/ui/button";
import { createFacetFromField } from "../../lib/datalayer/api";
import { cm } from "../../utils";

export const EditFieldsView = () => {
  const [filter, setFilter] = useState<string>("");
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const { data, isLoading } = useFields();
  const uniquePurpose = useMemo(() => {
    const purposeSet = new Set<string>();
    Object.values(data ?? {}).forEach((field) => {
      field.purpose?.forEach((purpose) => {
        purposeSet.add(purpose);
      });
    });
    return Array.from(purposeSet);
  }, [data]);
  const filteredData = useMemo(() => {
    return Object.entries(data ?? {})
      ?.filter(([key, field]) => {
        if (
          selectedPurpose != null &&
          !field.purpose?.includes(selectedPurpose)
        )
          return false;
        if (!filter.length) return selectedPurpose != null;
        if (key?.includes(filter) || key == filter) return true;
        return field.name.toLowerCase()?.includes(filter.toLowerCase());
      })
      .map(([key, field]) => ({
        ...field,
        key: key,
      }));
  }, [filter, data, selectedPurpose]);
  const addField = (fieldKey: string) => {
    createFacetFromField(fieldKey);
  };
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
        {isLoading && <li>Loading...</li>}
        {filteredData?.map((field) => (
          <li key={field.id} className="flex gap-2 items-center">
            <span className="text-sm font-bold">{field.name}</span>
            <span className="text-sm">({field.key})</span>
            <span className="text-sm">{field.description}</span>
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
            <Button size="sm" onClick={() => addField(field.key)}>
              Add
            </Button>
          </li>
        ))}
      </ul>
      <div>
        <span>
          {filteredData.length} / {Object.keys(data ?? {}).length}
        </span>
      </div>
    </div>
  );
};
