import { useState } from "react";
import { getItemIds, updateCategories } from "../lib/datalayer/api";
import { useAdmin } from "../hooks/appState";

import { Sorting } from "./Sorting";
import { SelectedStore } from "./StoreSelector";
import { X } from "lucide-react";
import { FilterQuery } from "./FilterQuery";
import { useQuery } from "../lib/hooks/QueryProvider";

const EditCategories = ({ onClose }: { onClose: () => void }) => {
  const { facets, query } = useQuery();

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
        {facets
          ?.filter((d) => d.valueType === "virtual")
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
  // const {
  //   query: { query },
  // } = useHashQuery();
  const { totalHits } = useQuery();
  const [open, setOpen] = useState(false);
  // const hasQuery = Boolean(query?.length);

  return (
    <>
      <header className="flex justify-between gap-2 items-center mb-2">
        <h1 className="md:text-2xl font-bold">
          Produkter ({totalHits ?? "~"})
        </h1>
        {admin && <button onClick={() => setOpen(true)}>Update</button>}
        <SelectedStore />
        <div className="relative">
          <Sorting />
        </div>
      </header>
      {/* <FilterQuery show={(totalHits ?? 0) > 40} /> */}
      {open && admin && <EditCategories onClose={() => setOpen(false)} />}
    </>
  );
};
