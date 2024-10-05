import { useState } from "react";
import { getItemIds, updateCategories } from "../api";
import { useAdmin } from "../appState";
import { useFacetList, useHashFacets, useHashQuery } from "../searchHooks";
import { Sorting } from "./Sorting";
import { SelectedStore } from "./StoreSelector";
import { X } from "lucide-react";

const EditCategories = ({ onClose }: { onClose: () => void }) => {
  const { data } = useFacetList();

  const { query } = useHashQuery();

  const updateItemCategories = (updates: { id: number; value: string }[]) => {
    return getItemIds(query).then((ids) => {
      //console.log(ids);
      updateCategories(ids, updates);
    });
  };

  return (
    <form
      className="absolute top-0 right-0 bg-white p-4 shadow-lg z-10"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const categories = Array.from(formData.entries()).map(
          ([id, value]) => ({
            id: Number(id),
            value: String(value),
          })
        );
        //console.log(categories);
        updateItemCategories(categories);
      }}
    >
      <button onClick={onClose} type="button">
        <X size={30} />
      </button>
      <ul className="flex flex-col gap-2">
        {data
          ?.filter((d) => d.type === "virtual")
          .map((category) => (
            <li key={category.id} className="flex">
              <label className="flex gap-4 items-center justify-between">
                <span className="flex-1">{category.name}</span>
                <input
                  type="text"
                  name={`${category.id}`}
                  defaultValue=""
                  className="border border-gray-400 rounded-md"
                />
              </label>
            </li>
          ))}
      </ul>
      <button type="submit">Save</button>
    </form>
  );
};

export const ResultHeader = () => {
  const [admin] = useAdmin();
  const { data } = useHashFacets();
  const [open, setOpen] = useState(false);
  if (!data || data.totalHits === 0) {
    return null;
  }

  return (
    <>
      <header className="flex justify-between gap-2 items-center mb-6">
        <h1 className="md:text-2xl font-bold">Produkter ({data.totalHits})</h1>
        {admin && <button onClick={() => setOpen(true)}>Update</button>}
        <SelectedStore />
        <div className="relative">
          <Sorting />
        </div>
      </header>
      {open && admin && <EditCategories onClose={() => setOpen(false)} />}
    </>
  );
};
