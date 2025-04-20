"use client";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ListIcon, TableIcon } from "lucide-react";


import { FacetProvider, useFacetSelection } from "./facet-context";

import { FacetToggle } from "./FacetToggle";
import { ToggleResultItem } from "./ResultItem";
import { QuickFilter, SelectedAdditionalFilter } from "../builder-types"
import { useBuilderContext } from "../useBuilderContext"
import { cm, makeImageUrl } from "../../../utils"
import { FilteringQuery, Sort } from "../../../lib/types"
import { isRangeFilter, isStringFilter } from "../builder-utils"
import { QueryProvider } from "../../../lib/hooks/QueryProvider"
import { QueryMerger } from "../../../components/QueryMerger"

const AppliedFilterView = ({
  filters,
}: {
  filters: (SelectedAdditionalFilter & { from?: number })[];
}) => {
  const { selectedItems } = useBuilderContext();
  const affectedByItems = useMemo(() => {
    const fromIds = new Set(
      filters.map((d) => d.from).filter((d) => d != null && d > 0),
    );
    return selectedItems.filter((d) => fromIds.has(d.componentId));
  }, [filters, selectedItems]);
  const { facets } = useFacetSelection();
  
  
  if (filters.length === 0) {
    return null;
  }
  return (
    <div className="bg-line p-4">
      <div className="flex justify-between gap-2">
        <h3 className="font-bold">
          Resultatet är filtrerat för att passa till:
        </h3>
        <div className="flex flex-wrap gap-2">
          {affectedByItems.map((item) => (
            <div key={item.id}>
              <img
                src={makeImageUrl(item.img)}
                alt={item.title}
                width={80}
                height={80}
                className="size-10 aspect-square object-contain mix-blend-multiply"
              />
            </div>
          ))}
        </div>
      </div>
      
        {/* <div className="flex flex-wrap gap-2 text-sm mt-4">
          {filters.map((filter) => {
            const facet = facets.find((f) => f.id === filter.id);
            if (facet == null || filter.value == null) {
              return null;
            }
            let toShow = "hidden";
            if (isRangeFilter(filter)) {
              toShow = `${filter.value.min} - ${filter.value.max}`;
            }
            if (isStringFilter(filter)) {
              toShow = Array.isArray(filter.value)
                ? filter.value.join(", ")
                : filter.value;
            }
            return (
              <div key={filter.id} className="bg-white p-1 px-6 rounded-2xl">
                {facet?.name}: {toShow}
              </div>
            );
          })}
        </div> */}
      
    </div>
  );
};

const matchesValue = (a: string | string[], b: string | string[]) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.every((d) => b.includes(d));
  }
  return a === b;
};

export const QuickFilters = ({
  filters,
  onApply,
}: {
  filters?: QuickFilter[];
  onApply: Dispatch<
    SetStateAction<Pick<FilteringQuery, "string" | "range" | "query">>
  >;
}) => {
  const { facets, query } = useFacetSelection();
  if (filters == null || filters.length === 0) {
    return null;
  }
  return (
    <div className="bg-line p-4 hidden md:block">
      {filters.map(({ name, options }) => {
        const validOptions = options.filter((option) => {
          const ids = new Set(option.filters.map((f) => f.id));
          return facets.some((d) => ids.has(d.id));
        });
        if (validOptions.length === 0) {
          return null;
        }
        return (
          <div key={name}>
            <h3 className="mb-4">{name}</h3>
            <div className="flex flex-wrap gap-2">
              {validOptions.map((option) => {
                const isSelected = option.filters.every(
                  (f) =>
                    query.string?.some(
                      (q) =>
                        q.id === f.id &&
                        matchesValue(q.value, f.value as string | string[]),
                    ) || query.range?.some((q) => q.id === f.id),
                );
                return (
                  <button
                    key={option.title}
                    onClick={() => {
                      const ids = new Set(option.filters.map((f) => f.id));

                      onApply((prev) => {
                        return {
                          ...prev,
                          // range: [
                          //   ...(prev.range?.filter((d) => !ids.has(d.id)) ?? []),
                          //   ...option.filters.filter(isRangeFilter),
                          // ],
                          string: [
                            ...(prev.string?.filter((d) => !ids.has(d.id)) ??
                              []),
                            ...option.filters.filter(isStringFilter),
                          ],
                        };
                      });
                    }}
                    className={cm(
                      "p-1 px-4 rounded-2xl",
                      isSelected ? "bg-blue-900 text-white" : "bg-white",
                    )}
                  >
                    {option.title}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const fixSingleArray = ({
  id,
  value,
}: {
  id: number;
  to: number;
  value: string | string[];
}): {
  id: number;
  value: string | string[];
} => {
  if (
    Array.isArray(value) &&
    value.length === 1 &&
    typeof value[0] === "string"
  ) {
    return { id, value: value[0] };
  }
  return { id, value };
};

type ComponentSelectorContext = {
  view: "table" | "list";
  setView: Dispatch<SetStateAction<"table" | "list">>;
  selectedIds?: number[];
  tableSort?: [number, "asc" | "desc"];
  setTableSort?: Dispatch<SetStateAction<[number, "asc" | "desc"] | undefined>>;
};

const ComponentSelectorContext = createContext<ComponentSelectorContext | null>(
  null,
);

export const useComponentSelectorContext = () => {
  const context = useFacetSelection();
  if (context == null) {
    throw new Error(
      "useComponentSelectorContext must be used within a ComponentSelectorProvider",
    );
  }
  return context;
};

export const ComponentSelector = ({
  topFilters,
  filter,
  importantFacets,
  quickFilters,
  otherFilters,
  selectedIds,
  validator,
  onSelectedChange,
}: ComponentSelectorProps) => {
  const { globalFilters } = useBuilderContext();
  //const isLarge = useBreakpoint(1280);
  // const [userFiler, setUserFilter] = useState<
  //   Pick<FilteringQuery, "range" | "string" | "query">
  // >({ range: [], string: [] });
  //const [sort, setSort] = useState<Sort>("popular");
  //const [view, setView] = useState<"table" | "list">("list");
  //const [tableSort, setTableSort] = useState<[number, "asc" | "desc"]>();
  // useEffect(() => {
  //   setView(isLarge ? "table" : "list");
  // }, [isLarge]);
  const baseQuery = useMemo(() => {
    return {
      ...filter,
      ...globalFilters,
      range: [
        ...otherFilters
          .filter(isRangeFilter)
          .map(({ id, value }) => ({ id, min: value.min, max: value.max })),
        ...(filter.range ?? []),
        ...(userFiler.range ?? []),
        ...(globalFilters.range ?? []),
      ],
      query: userFiler.query,
      string: [
        ...otherFilters.filter(isStringFilter).map(fixSingleArray),
        ...(filter.string ?? []),
        ...(userFiler.string ?? []),
        ...(globalFilters.string ?? []),
      ],
    } satisfies FilteringQuery;
  }, [filter, otherFilters, userFiler, globalFilters]);

  // const facetResult = useFacets(baseQuery);
  // const { data: facets } = useFacetList();
  // const { data } = useItemsSearch({ ...baseQuery, sort, pageSize: 120 });

  return (<QueryProvider initialQuery={baseQuery}>
        <QueryMerger query={baseQuery} />
    <ComponentSelectorContext.Provider
      value={{
        view,
        setView,
        selectedIds: selectedIds,
        tableSort,
        setTableSort,
      }}
    >
      
        <div className="">
          <div className="space-y-2">
            <AppliedFilterView filters={otherFilters}></AppliedFilterView>

            <QuickFilters filters={quickFilters} onApply={setUserFilter} />

            <div className="flex gap-2">
              <FacetToggle topFilters={topFilters ?? []}></FacetToggle>
              <div>
                <button
                  className="border border-line p-1"
                  onClick={() =>
                    setView((prev) => (prev === "table" ? "list" : "table"))
                  }
                >
                  {view === "table" ? (
                    <ListIcon className="size-5" />
                  ) : (
                    <TableIcon className="size-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="hidden md:flex gap-2">
              <input
                type="text"
                placeholder="Sök..."
                value={userFiler.query}
                onChange={(e) =>
                  setUserFilter({ ...userFiler, query: e.target.value })
                }
                className="w-full p-2 border border-line flex-1 text-sm"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="appearance-none bg-white border border-line py-2 pl-3 pr-10 leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="popular">Popularitet</option>
                <option value="price">Pris</option>
                <option value="price_desc">Pris fallande</option>
                <option value="updated">Senast uppdaterat</option>
                <option value="created">Nyheter</option>
              </select>
            </div>
            {view === "list" ? (
              <div className="flex flex-col gap-2">
                {data?.items.map((item) => (
                  <ToggleResultItem
                    key={item.id}
                    {...item}
                    tableFacets={importantFacets}
                    isValid={validator != null ? validator(item.values) : true}
                    selected={selectedIds.includes(Number(item.id))}
                    onSelectedChange={(data) => {
                      onSelectedChange(data);
                    }}
                  />
                ))}
              </div>
            ) : (
              <table className="text-sm datatable">
                <thead>
                  <tr>
                    <th></th>
                    <th></th>
                    {importantFacets?.map((d) => {
                      const facet = facets?.find((f) => f.id === d);

                      return <th key={d}>{facet?.name ?? ""}</th>;
                    })}
                    <th>Pris</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <img
                          src={makeImageUrl(item.img)}
                          alt={item.title}
                          width={80}
                          height={80}
                          className="aspect-square object-contain size-10"
                        />
                      </td>
                      <td>{item.title}</td>
                      {importantFacets?.map((d) => {
                        return <td key={d}>{item.values[d] ?? ""}</td>;
                      })}
                      <td>{item.values[4] / 100}</td>
                      <th>
                        <button
                          className="inverted-link"
                          onClick={() =>
                            onSelectedChange(
                              selectedIds.includes(item.id) ? null : item,
                            )
                          }
                        >
                          Välj
                        </button>
                      </th>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
    
    </ComponentSelectorContext.Provider>
  </QueryProvider>

  );
};
