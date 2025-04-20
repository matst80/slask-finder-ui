"use client";
import {
  useMemo,
  useState,
  
} from "react";

import { ListIcon, TableIcon } from "lucide-react";




import { FacetToggle } from "./FacetToggle";
import { ToggleResultItem } from "./ResultItem";
import { ComponentSelectorProps, QuickFilter, SelectedAdditionalFilter } from "../builder-types"
import { useBuilderContext } from "../useBuilderContext"
import { cm, isDefined, makeImageUrl } from "../../../utils"
import { FilteringQuery } from "../../../lib/types"
import { isRangeFilter, isStringFilter } from "../builder-utils"
import { QueryProvider } from "../../../lib/hooks/QueryProvider"
import { QueryMerger } from "../../../components/QueryMerger"
import { HitList, HitListFragment } from "../../../components/HitList"
import { useFacetMap } from "../../../hooks/searchHooks"
import { useQuery } from "../../../lib/hooks/useQuery"
import { ComponentSelectorContext } from "./ComponentSelectorContext"

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
  
}: {
  filters?: QuickFilter[];
  
}) => {
  const { facets, query, setQuery } = useQuery();
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

                      setQuery((prev) => {
                        return {
                          ...prev,
                          // range: [
                          //   ...(prev.range?.filter((d) => !ids.has(d.id)) ?? []),
                          //   ...option.filters.filter(isRangeFilter),
                          // ],
                          string: [
                            ...(prev.string?.filter((d) => !ids.has(d.id)) ??
                              []),
                            ...option.filters.filter(isStringFilter).map(fixSingleArray),
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
  value: string[];
} => {
  if (
    Array.isArray(value) 
  ) {
    return { id, value };
  }
  return { id, value: [value] };
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
  const {data} = useFacetMap();
  //const isLarge = useBreakpoint(1280);
  // const [userFiler, setUserFilter] = useState<
  //   Pick<FilteringQuery, "range" | "string" | "query">
  // >({ range: [], string: [] });
  //const [sort, setSort] = useState<Sort>("popular");
  const [view, setView] = useState<"table" | "list">("list");
  const [tableSort, setTableSort] = useState<[number, "asc" | "desc"]>();
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
        //...(userFiler.range ?? []),
        ...(globalFilters.range ?? []),
      ],
      //query: userFiler.query,
      string: [
        ...otherFilters.filter(isStringFilter).map(fixSingleArray),
        ...(filter.string ?? []),
        //...(userFiler.string ?? []),
        ...(globalFilters.string ?? []),
      ],
    } satisfies FilteringQuery;
  }, [filter, otherFilters, globalFilters]);

  const facets = useMemo(() => {
    return importantFacets?.map((d) => {
      return data?.[d]
    }).filter(isDefined)??[];
  }, [data,importantFacets]);

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

            <QuickFilters filters={quickFilters}  />

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
            {/* <div className="hidden md:flex gap-2">
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
            </div> */}
            {view === "list" ? (
              
                <HitList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">{({item})=>(<ToggleResultItem
                    key={item.id}
                    {...item}
                    tableFacets={importantFacets}
                    isValid={validator != null ? validator(item.values) : true}
                    selected={selectedIds.includes(Number(item.id))}
                    onSelectedChange={(data) => {
                      onSelectedChange(data);
                    }}
                  />)}</HitList>
                
              
            ) : (
              <table className="text-sm datatable">
                <thead>
                  <tr>
                    <th></th>
                    <th></th>
                    {facets.map((d) => {
                      

                      return <th key={d.id}>{d.name}</th>;
                    })}
                    <th>Pris</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <HitListFragment>
                    {({item})=>(<tr key={item.id}>
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
                    </tr>)}
                  </HitListFragment>
                  
                </tbody>
              </table>
            )}
          </div>
        </div>
    
    </ComponentSelectorContext.Provider>
  </QueryProvider>

  );
};
