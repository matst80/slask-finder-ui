// "use client";
// import { useMemo, useState } from "react";

// import { ListIcon, TableIcon } from "lucide-react";

// import { ToggleResultItem } from "./ResultItem";
// import { ComponentSelectorProps, QuickFilter } from "../builder-types";
// import { useBuilderContext } from "../useBuilderContext";
// import { cm, isDefined, makeImageUrl } from "../../../utils";
// import { FilteringQuery } from "../../../lib/types";
// import {
//   fixSingleArray,
//   isRangeFilter,
//   isStringFilter,
// } from "../builder-utils";
// import { QueryProvider } from "../../../lib/hooks/QueryProvider";
// import { QueryMerger } from "../../../components/QueryMerger";
// import { HitList, HitListFragment } from "../../../components/HitList";
// import { useFacetMap } from "../../../hooks/searchHooks";
// import { useQuery } from "../../../lib/hooks/useQuery";
// import { ComponentSelectorContext } from "./ComponentSelectorContext";
// import { FacetList } from "../../../components/Facets";
// import { Button } from "../../../components/ui/button";

// const AppliedFilterView = ({
//   filters,
// }: {
//   filters: (SelectedAdditionalFilter & { from?: number })[];
// }) => {
//   const { selectedItems } = useBuilderContext();
//   const affectedByItems = useMemo(() => {
//     const fromIds = new Set(
//       filters.map((d) => d.from).filter((d) => d != null && d > 0)
//     );
//     return selectedItems.filter((d) => fromIds.has(d.componentId));
//   }, [filters, selectedItems]);

//   if (filters.length === 0) {
//     return null;
//   }
//   return (
//     <div className="bg-gradient-to-r from-blue-50 to-gray-50 p-5 rounded-lg shadow-sm mb-4 border border-gray-100">
//       <div className="flex flex-col md:flex-row justify-between gap-4">
//         <h3 className="font-semibold text-gray-800 flex items-center">
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
//           </svg>
//           Resultatet är filtrerat för att passa till:
//         </h3>
//         <div className="flex flex-wrap gap-3 items-center">
//           {affectedByItems.map((item) => (
//             <div key={item.id} className="flex flex-col items-center group relative">
//               <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 transform transition-transform group-hover:scale-105">
//                 <img
//                   src={makeImageUrl(item.img)}
//                   alt={item.title}
//                   width={80}
//                   height={80}
//                   className="size-14 aspect-square object-contain mix-blend-multiply"
//                 />
//               </div>
//               <span className="text-xs text-gray-600 max-w-[80px] truncate mt-1">{item.title}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// const matchesValue = (a: string | string[], b: string | string[]) => {
//   if (Array.isArray(a) && Array.isArray(b)) {
//     return a.every((d) => b.includes(d));
//   }
//   return a === b;
// };

// export const QuickFilters = ({ filters }: { filters?: QuickFilter[] }) => {
//   const { facets, query, setQuery } = useQuery();
//   if (filters == null || filters.length === 0) {
//     return null;
//   }
//   return (
//     <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg shadow-sm mb-6 hidden md:block border border-blue-200">
//       <h2 className="text-blue-800 font-semibold mb-4 flex items-center">
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           className="h-5 w-5 mr-2"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
//           />
//         </svg>
//         Snabbfilter
//       </h2>

//       <div className="space-y-5">
//         {filters.map(({ name, options }) => {
//           const validOptions = options.filter((option) => {
//             const ids = new Set(option.filters.map((f) => f.id));
//             return facets.some((d) => ids.has(d.id));
//           });
//           if (validOptions.length === 0) {
//             return null;
//           }
//           return (
//             <div
//               key={name}
//               className="border-b border-blue-200 pb-4 last:border-0"
//             >
//               <h3 className="mb-3 text-gray-700 font-medium">{name}</h3>
//               <div className="flex flex-wrap gap-2">
//                 {validOptions.map((option) => {
//                   const isSelected = option.filters.every(
//                     (f) =>
//                       query.string?.some(
//                         (q) =>
//                           q.id === f.id &&
//                           matchesValue(q.value, f.value as string | string[])
//                       ) || query.range?.some((q) => q.id === f.id)
//                   );
//                   return (
//                     <button
//                       key={option.title}
//                       onClick={() => {
//                         const ids = new Set(option.filters.map((f) => f.id));

//                         setQuery((prev) => {
//                           return {
//                             ...prev,
//                             string: [
//                               ...(prev.string?.filter((d) => !ids.has(d.id)) ??
//                                 []),
//                               ...option.filters
//                                 .filter(isStringFilter)
//                                 .map(fixSingleArray),
//                             ],
//                           };
//                         });
//                       }}
//                       className={cm(
//                         "py-1.5 px-4 rounded-full text-sm transition-all duration-200 font-medium",
//                         isSelected
//                           ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
//                           : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
//                       )}
//                     >
//                       {option.title}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export const ComponentSelector = ({
//   filter,
//   importantFacets,
//   quickFilters,
//   otherFilters,
//   selectedIds,
//   validator,
//   onSelectedChange,
// }: ComponentSelectorProps) => {
//   const { globalFilters } = useBuilderContext();
//   const { data } = useFacetMap();
//   //const isLarge = useBreakpoint(1280);
//   // const [userFiler, setUserFilter] = useState<
//   //   Pick<FilteringQuery, "range" | "string" | "query">
//   // >({ range: [], string: [] });
//   //const [sort, setSort] = useState<Sort>("popular");
//   const [view, setView] = useState<"table" | "list">("list");
//   const [tableSort, setTableSort] = useState<[number, "asc" | "desc"]>();
//   // useEffect(() => {
//   //   setView(isLarge ? "table" : "list");
//   // }, [isLarge]);
//   const baseQuery = useMemo(() => {
//     return {
//       ...filter,
//       ...globalFilters,
//       range: [
//         ...otherFilters
//           .filter(isRangeFilter)
//           .map(({ id, value }) => ({ id, min: value.min, max: value.max })),
//         ...(filter.range ?? []),
//         //...(userFiler.range ?? []),
//         ...(globalFilters.range ?? []),
//       ],
//       //query: userFiler.query,
//       string: [
//         ...otherFilters.filter(isStringFilter).map(fixSingleArray),
//         ...(filter.string ?? []),
//         //...(userFiler.string ?? []),
//         ...(globalFilters.string ?? []),
//       ],
//     } satisfies FilteringQuery;
//   }, [filter, otherFilters, globalFilters]);

//   const facets = useMemo(() => {
//     return (
//       importantFacets
//         ?.map((d) => {
//           return data?.[d];
//         })
//         .filter(isDefined) ?? []
//     );
//   }, [data, importantFacets]);

//   // const facetResult = useFacets(baseQuery);
//   // const { data: facets } = useFacetList();
//   // const { data } = useItemsSearch({ ...baseQuery, sort, pageSize: 120 });

//   return (
//     <QueryProvider initialQuery={baseQuery}>
//       <QueryMerger query={baseQuery} />
//       <ComponentSelectorContext.Provider
//         value={{
//           view,
//           setView,
//           selectedIds: selectedIds,
//           tableSort,
//           setTableSort,
//         }}
//       >
//         <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
//           <div className="flex flex-col gap-2">
//             {/* <FacetToggle topFilters={topFilters ?? []}></FacetToggle> */}
//             <FacetList facetsToHide={[10, 11, 12, 13, 14, 31158]} />
//             <div>
//               <button
//                 className="border border-line p-1"
//                 onClick={() =>
//                   setView((prev) => (prev === "table" ? "list" : "table"))
//                 }
//               >
//                 {view === "table" ? (
//                   <ListIcon className="size-5" />
//                 ) : (
//                   <TableIcon className="size-5" />
//                 )}
//               </button>
//             </div>
//           </div>
//           {/* <div className="hidden md:flex gap-2">
//               <input
//                 type="text"
//                 placeholder="Sök..."
//                 value={userFiler.query}
//                 onChange={(e) =>
//                   setUserFilter({ ...userFiler, query: e.target.value })
//                 }
//                 className="w-full p-2 border border-line flex-1 text-sm"
//               />
//               <select
//                 value={sort}
//                 onChange={(e) => setSort(e.target.value as Sort)}
//                 className="appearance-none bg-white border border-line py-2 pl-3 pr-10 leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//               >
//                 <option value="popular">Popularitet</option>
//                 <option value="price">Pris</option>
//                 <option value="price_desc">Pris fallande</option>
//                 <option value="updated">Senast uppdaterat</option>
//                 <option value="created">Nyheter</option>
//               </select>
//             </div> */}
//           <div>
//             {/* <AppliedFilterView filters={otherFilters}></AppliedFilterView> */}

//             <QuickFilters filters={quickFilters} />
//             {view === "list" ? (
//               <HitList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 -mx-4 md:-mx-0">
//                 {({ item }) => (
//                   <ToggleResultItem
//                     key={item.id}
//                     {...item}
//                     tableFacets={importantFacets}
//                     isValid={validator != null ? validator(item.values) : true}
//                     selected={selectedIds.includes(Number(item.id))}
//                     onSelectedChange={(data) => {
//                       onSelectedChange(data);
//                     }}
//                   />
//                 )}
//               </HitList>
//             ) : (
//               <div className="overflow-x-auto rounded-md shadow">
//                 <table className="w-full border-collapse text-sm">
//                   <thead>
//                     <tr className="bg-gray-100 text-left">
//                       <th className="p-3 font-medium text-gray-700 w-24"></th>
//                       <th className="p-3 font-medium text-gray-700">Produkt</th>

//                       {facets.map((d) => (
//                         <th
//                           key={d.id}
//                           className="p-3 font-medium text-gray-700"
//                           onClick={() =>
//                             setTableSort((prev) =>
//                               prev?.[0] === d.id
//                                 ? [d.id, prev[1] === "asc" ? "desc" : "asc"]
//                                 : [d.id, "asc"]
//                             )
//                           }
//                         >
//                           <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
//                             {d.name}
//                             {tableSort?.[0] === d.id && (
//                               <span>{tableSort[1] === "asc" ? "↑" : "↓"}</span>
//                             )}
//                           </div>
//                         </th>
//                       ))}
//                       <th className="p-3 font-medium text-gray-700">Pris</th>
//                       <th className="p-3 font-medium text-gray-700"></th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     <HitListFragment>
//                       {({ item }) => (
//                         <tr
//                           key={item.id}
//                           className={`border-b border-gray-200 hover:bg-gray-50 ${
//                             selectedIds.includes(item.id) ? "bg-blue-50" : ""
//                           }`}
//                         >
//                           <td className="p-3">
//                             <div className="flex justify-center">
//                               <img
//                                 src={makeImageUrl(item.img)}
//                                 alt={item.title}
//                                 width={80}
//                                 height={80}
//                                 className="aspect-square object-contain mix-blend-multiply"
//                               />
//                             </div>
//                           </td>
//                           <td className="p-3 font-medium">{item.title}</td>

//                           {importantFacets?.map((d) => (
//                             <td key={d} className="p-3">
//                               {item.values[d] ?? "-"}
//                             </td>
//                           ))}
//                           <td className="p-3 font-medium">
//                             {(item.values[4] / 100).toLocaleString()} kr
//                           </td>
//                           <td className="p-3">
//                             <Button
//                               size="sm"
//                               variant={
//                                 selectedIds.includes(item.id)
//                                   ? "outline"
//                                   : "default"
//                               }
//                               className={
//                                 selectedIds.includes(item.id)
//                                   ? "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
//                                   : ""
//                               }
//                               onClick={() =>
//                                 onSelectedChange(
//                                   selectedIds.includes(item.id) ? null : item
//                                 )
//                               }
//                             >
//                               {selectedIds.includes(item.id) ? "Vald" : "Välj"}
//                             </Button>
//                           </td>
//                         </tr>
//                       )}
//                     </HitListFragment>
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>
//       </ComponentSelectorContext.Provider>
//     </QueryProvider>
//   );
// };
