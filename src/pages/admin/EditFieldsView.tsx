import { useMemo, useState } from "react";
import { useFields } from "../../adminHooks";
import { Button } from "../../components/ui/button";
import { createFacetFromField } from "../../lib/datalayer/api";

export const EditFieldsView = () => {
  const [filter, setFilter] = useState<string>("");
  const { data, isLoading } = useFields();
  const filteredData = useMemo(() => {
    return Object.entries(data ?? {})
      ?.filter(([key, field]) => {
        if (!filter.length) return false;
        if (key?.includes(filter) || key == filter) return true;
        return field.name.toLowerCase()?.includes(filter.toLowerCase());
      })
      .map(([key, field]) => ({
        ...field,
        key: key,
      }));
  }, [filter, data]);
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
            <span className="text-sm">{field.description}</span>
            <span className="text-sm">{field.purpose?.join(", ")}</span>
            <Button size="sm" onClick={() => addField(field.key)}>
              Add
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};
