import { useMemo } from "react";

import { Sorting } from "./Sorting";
import { SelectedStore } from "./StoreSelector";

import { useQuery } from "../lib/hooks/QueryProvider";
import { FilterQuery } from "./FilterQuery";
import { facetQueryToHash } from "../hooks/searchHooks";
import { Button } from "./ui/button";

// const EditCategories = ({ onClose }: { onClose: () => void }) => {
//   const { facets, query } = useQuery();

//   const updateItemCategories = (updates: { id: number; value: string }[]) => {
//     return getItemIds(query).then((ids) => {
//       //console.log(ids);
//       updateCategories(ids, updates);
//     });
//   };

//   return (
//     <form
//       className="absolute top-0 right-0 bg-white p-4 shadow-lg z-10"
//       onSubmit={(e) => {
//         e.preventDefault();
//         const formData = new FormData(e.currentTarget);

//         const categories = Array.from(formData.entries()).map(
//           ([id, value]) => ({
//             id: Number(id),
//             value: String(value),
//           })
//         );
//         //console.log(categories);
//         updateItemCategories(categories);
//       }}
//     >
//       <button onClick={onClose} type="button">
//         <X size={30} />
//       </button>
//       <ul className="flex flex-col gap-2">
//         {facets
//           ?.filter((d) => d.valueType === "virtual")
//           .map((category) => (
//             <li key={category.id} className="flex">
//               <label className="flex gap-4 items-center justify-between">
//                 <span className="flex-1">{category.name}</span>
//                 <input
//                   type="text"
//                   name={`${category.id}`}
//                   defaultValue=""
//                   className="border border-gray-400 rounded-md"
//                 />
//               </label>
//             </li>
//           ))}
//       </ul>
//       <button type="submit">Save</button>
//     </form>
//   );
// };

export const ResultHeader = () => {
  const { totalHits, queryHistory, query, setQuery } = useQuery();
  const currentKey = useMemo(() => facetQueryToHash(query), [query]);

  const prevQuery = useMemo(() => {
    const idx = queryHistory.findIndex((d) => d.key === currentKey);
    if (idx === -1) {
      return null;
    }
    return queryHistory[idx - 1] ?? null;
  }, [queryHistory, currentKey]);
  return (
    <>
      <header className="flex justify-between gap-2 items-center mb-2">
        <h1 className="md:text-2xl font-bold">Results ({totalHits ?? "~"}) </h1>

        <SelectedStore />
        <div className="relative flex gap-2 items-center">
          {prevQuery != null && (
            <Button
              className="hidden md:block"
              size="sm"
              onClick={() => setQuery(prevQuery)}
            >
              ⇦ Back
            </Button>
          )}
          <Sorting />
        </div>
      </header>
      <FilterQuery show={(totalHits ?? 0) > 40} />
    </>
  );
};
