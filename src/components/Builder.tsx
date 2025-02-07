import { PropsWithChildren, useMemo, useState } from "react";
import { useFacetList, useFacets, useItemsSearch } from "../hooks/searchHooks";
import { FilteringQuery, Item, ItemsQuery, ItemValues, Sort } from "../types";
import { ResultItemInner } from "./ResultItem";
import { cm, isDefined } from "../utils";
import { PriceValue } from "./Price";
import { FacetList } from "./facets/facet-context";

type AdditionalFilter = {
  id: number;
  to: number;
  converter?: (value: ItemValues) => {
    id: number;
    value: string | string[] | { min: number; max: number };
  }[];
};

type Component = {
  title: string;
  id: number;
  validator?: (values: ItemValues) => boolean;
  filtersToApply: AdditionalFilter[];
  filter: ItemsQuery;
};

type SelectedAdditionalFilter = AdditionalFilter & {
  value: string | string[] | { min: number; max: number };
};

const importantFilterIds = [
  31187, 36209, 35989, 35990, 35922, 35978, 32073, 31009, 30634, 31991, 32186,
  36261, 36245, 32161, 33514, 36224, 36225, 36226, 36227, 36228, 36229, 36230,
  36231, 36232, 36233, 36234, 36235, 36236, 36237, 36238, 36239, 31396, 36268,
  36252, 36284, 31986, 32057, 31190, 30857, 36211, 32183, 33531, 33574, 33575,
  33533, 33576, 33577, 34582, 34583, 36301, 30007, 36302, 32062, 36338,
];
const wattIds = [35990, 32186];

const components: Component[] = [
  {
    title: "CPU",
    id: 1,
    filtersToApply: [
      { id: 32103, to: 2 },
      // add chipset, when we get all chipsets!
      {
        // min memory speed
        id: 35980,
        to: 3,
        converter: (value) => {
          const min = Number(value[35980]);
          if (isNaN(min)) return [];
          return [
            { id: 31191, value: { min: Number(value[35980]), max: 999999 } },
          ];
        },
      },
    ],
    
    validator: (values) => {
      if (isNaN(Number(values[35980]))) return false;
      return values[32103] != null;
    },
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 40,
      stock: [],
      string: [
        // {
        //   id: 11,
        //   value: "Datorkomponenter",
        // },
        {
          id: 31158,
          value: "Processor (CPU)",
        },
      ],
    },
  },
  {
    title: "Moderkort",
    id: 2,
    validator: (values) => {
      return (
        values[32103] != null &&
        values[35921] != null &&
        values[30857] != null &&
        values[30857] != "X" &&
        values[35921] != "X"
      );
    },
    filtersToApply: [
      { id: 32103, to: 1 }, // cpu socket
      // add chipset, when we get all chipsets!
      { id: 35921, to: 3 }, // ram type
      { id: 30857, to: 3 }, // ram pins
      // maybe add max ram speed or in ui!
      {
        id: 36249,
        to: 4,
        converter: (values) => {
          // m2 slots and gen
          const m2Slots = Number(values[36245]);
          const ret = [];
          if (m2Slots > 0) {
            // const size = values[36210]; // max size
            const gen = values[36211];
            if (gen != null && typeof gen === "string") {
              const genNr = Number(gen.split(".")[0]);
              // add max size!!!!
              const values = [];
              for (let i = 1; i <= genNr; i++) {
                values.push(`${i}.0`);
              }
              ret.push({ id: 36249, value: values });
              //ret.push({ id: /* to be added */, value: {min:0, max:Number(size)} });
            }
          }
          return ret;
        },
      },
      {
        id: 30552,
        to: 7,
        converter: (values) => {
          const formFactor = values[30552];
          const allowed = [];
          if (typeof formFactor === "string") {
            if (formFactor.includes("Mini") || formFactor.includes("mATX")) {
              allowed.push("Mini-ITX");
            } else {
              allowed.push("ATX");
              if (formFactor.includes("eATX")) {
                allowed.push("eATX");
              }
            }
            return [{ id: 32056, value: formFactor }];
          }
          return [];
        },
      },
      // number of ram slots / max ram per slot?
    ],
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 40,
      stock: [],
      string: [
        // {
        //   id: 11,
        //   value: "Datorkomponenter",
        // },
        {
          id: 31158,
          value: "Moderkort",
        },
      ],
    },
  },
  {
    title: "Minne",
    id: 3,
    filtersToApply: [
      { id: 30857, to: 2 },
      { id: 35921, to: 2 },
    ],
    validator: (values) => {
      return (
        values[35921] != null &&
        values[35921] != "X" &&
        values[30857] != null &&
        values[30857] != "X"
      );
    },
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 40,
      stock: [],
      string: [
        // {
        //   id: 11,
        //   value: "Datorkomponenter",
        // },
        {
          id: 31158,
          value: "RAM minne",
        },
      ],
    },
  },
  {
    title: "Hårddisk",
    id: 4,
    filtersToApply: [],
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 40,
      stock: [],
      string: [
        // {
        //   id: 11,
        //   value: "Datorkomponenter",
        // },
        {
          id: 31158,
          value: "Intern SSD",
        },
      ],
    },
  },
  {
    title: "Grafikkort",
    id: 5,
    filtersToApply: [
      {
        id: 30376,
        to: 7,
        converter: (values) => {
          const gpuSize = Number(values[30376]);
          if (isNaN(gpuSize)) {
            console.log("Invalid gpu size", values[30376]);
            return [];
          }
          console.log("GPU size", gpuSize);
          return [
            {
              id: 32062,
              value: { min: Number(values[30376]) * 10, max: 999999 },
            },
          ];
        },
      },
    ],
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 40,
      stock: [],
      string: [
        // {
        //   id: 11,
        //   value: "Datorkomponenter",
        // },
        {
          id: 31158,
          value: "Grafikkort",
        },
      ],
    },
  },
  {
    title: "Chassi",
    filtersToApply: [
      {
        id: 32062,
        to: 5,
        converter: (values) => {
          const maxGpuSize = Number(values[32062]);
          if (isNaN(maxGpuSize)) {
            console.log("Invalid gpu size", values[32062]);
            return [];
          }
          console.log("MAX GPU size", maxGpuSize);
          return [
            {
              id: 30376,
              value: { max: maxGpuSize / 10, min: 1 },
            },
          ];
        },
      },
      {
        id: 36284,
        to: 6,
        converter: (values) => {
          if (typeof values[36284] != "string") return [];
          return [{ id: 36252, value: values[36284] }];
        },
      },
      {
        id: 32056,
        to: 2,
        converter: (values) => {
          console.log(values);
          const formFactor = values[32056];
          const allowed = [];
          if (typeof formFactor === "string") {
            if (formFactor.includes("Mini") || formFactor.includes("mATX")) {
              allowed.push("Mini-ITX");
            } else {
              allowed.push("ATX");
              if (formFactor.includes("eATX")) {
                allowed.push("eATX");
              }
            }
            return [{ id: 30552, value: formFactor }];
          }
          return [];
        },
      },
    ],
    id: 7,
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 40,
      stock: [],
      string: [
        // {
        //   id: 11,
        //   value: "Datorkomponenter",
        // },
        {
          id: 31158,
          value: "Chassi",
        },
      ],
    },
  },
  {
    title: "Nätaggregat",
    id: 6,
    filtersToApply: [
      {
        id: 36252,
        to: 7,
        converter: (values) => {
          if (typeof values[36252] != "string") return [];
          return [{ id: 36284, value: values[36252] }];
        },
      },
    ],
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 40,
      stock: [],
      string: [
        // {
        //   id: 11,
        //   value: "Datorkomponenter",
        // },
        {
          id: 31158,
          value: "Nätaggregat (PSU)",
        },
      ],
    },
  },
  {
    title: "CPU kylare",
    id: 8,
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 40,
      stock: [],
      string: [
        {
          id: 31158,
          value: ["CPU luftkylning", "Vattenkylning"],
        },
      ],
    },
    filtersToApply: [],
  },
  {
    title: "Extra SSD Lagring",
    id: 9,
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 40,
      stock: [],
      string: [
        {
          id: 31158,
          value: "Intern SSD",
        },
        {
          id: 30714,
          value: "SATA 3.0",
        },
      ],
    },
    filtersToApply: [],
  },
  // {
  //   title: "Tangentbord",
  //   id: 10,
  //   filter: {
  //     range: [],
  //     sort: "popular",
  //     page: 0,
  //     pageSize: 40,
  //     stock: [],
  //     string: [
  //       {
  //         id: 31158,
  //         value: "Tangentbord",
  //       },
  //     ],
  //   },
  //   filtersToApply: [],
  // },
  // {
  //   title: "Mus",
  //   id: 11,
  //   filter: {
  //     range: [],
  //     sort: "popular",
  //     page: 0,
  //     pageSize: 40,
  //     stock: [],
  //     string: [
  //       {
  //         id: 31158,
  //         value: "Mus",
  //       },
  //     ],
  //   },
  //   filtersToApply: [],
  // },
];

const ToggleResultItem = ({
  selected,
  isValid,
  ...item
}: Item & { selected: boolean; isValid: boolean } & OnSelectedItem) => {
  return (
    <ItemWithHoverDetails
      item={item}
      key={item.id}
      className={cm(
        isValid
          ? selected
            ? "border-gray-300 border"
            : ""
          : "border-red-500 border",
        "rounded-md"
      )}
      onClick={(e) => {
        if (!isValid) return;
        e.preventDefault();
        item.onSelectedChange(selected ? null : item);
      }}
    >
      <ResultItemInner {...item} />
    </ItemWithHoverDetails>
  );
};

type OnSelectedItem = { onSelectedChange: (data: Item | null) => void };
type ComponentSelectorProps = Component &
  OnSelectedItem & {
    selectedIds: number[];
    otherFilters: SelectedAdditionalFilter[];
  };

const isRangeFilter = (
  d: SelectedAdditionalFilter
): d is { id: number; to: number; value: { min: number; max: number } } => {
  return (
    "value" in d &&
    d.value != null &&
    typeof d.value === "object" &&
    "min" in (d.value as { min: number; max: number }) &&
    "max" in (d.value as { min: number; max: number })
  );
};

const isStringFilter = (
  d: SelectedAdditionalFilter
): d is { id: number; to: number; value: string | string[] } => {
  return (
    "value" in d && (Array.isArray(d.value) || typeof d.value === "string")
  );
};

const ComponentSelector = ({
  title,
  filter,
  otherFilters,
  selectedIds,
  validator,
  onSelectedChange,
}: ComponentSelectorProps) => {
  const [userFiler, setUserFilter] = useState<
    Pick<FilteringQuery, "range" | "string" | "query">
  >({ range: [], string: [] });
  const [sort, setSort] = useState<Sort>("popular");
  const baseQuery = {
    ...filter,
    range: [
      ...otherFilters
        .filter(isRangeFilter)
        .map(({ id, value }) => ({ id, min: value.min, max: value.max })),
      ...(filter.range ?? []),
      ...(userFiler.range ?? []),
    ],
    query: userFiler.query,
    string: [
      //{id:3,value:"!0"},
      ...otherFilters.filter(isStringFilter),
      ...(filter.string ?? []),
      ...(userFiler.string ?? []),
    ],
  } satisfies FilteringQuery;
  const { data } = useItemsSearch({ ...baseQuery, sort });
  const facetResult = useFacets(baseQuery);

  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gray-200 p-4 mb-4">
      <button className="text-xl" onClick={() => setOpen((p) => !p)}>
        {title} ({data?.totalHits ?? "Loading..."}){" "}
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-6">
          <div className="hidden md:block">
            {facetResult.data == null ? (
              <div>Loading...</div>
            ) : (
              <FacetList
                facets={facetResult.data}
                onFilterChanged={setUserFilter}
                facetsToHide={[
                  9,
                  10,
                  11,
                  12,
                  13,
                  14,
                  31158,
                  ...otherFilters.map((d) => d.id),
                ]}
              />
            )}
          </div>
          <div>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Sök..."
                value={userFiler.query}
                onChange={(e) =>
                  setUserFilter({ ...userFiler, query: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md flex-1"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="popular">Popularitet</option>
                <option value="price">Pris</option>
                <option value="price_desc">Pris fallande</option>
                <option value="updated">Senast uppdaterat</option>
                <option value="updated_desc">
                  Senast uppdaterat (fallande)
                </option>
                <option value="created">Nyheter</option>
                <option value="created_desc">Älsta</option>
              </select>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 m-6">
              {data?.items.map((item) => (
                <ToggleResultItem
                  key={item.id}
                  {...item}
                  isValid={validator != null ? validator(item.values) : true}
                  selected={selectedIds.includes(Number(item.id))}
                  onSelectedChange={(data) => {
                    if (data) {
                      setOpen(false);
                    }
                    onSelectedChange(data);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const wattSteps = [400, 500, 600, 700, 750, 800, 850, 900, 1000, 1200];
const uselessIds = [
  31158, 11, 9, 10, 12, 13, 14, 15, 31158, 1, 2, 3, 4, 5, 6, 7, 30, 31, 32, 33,
  24, 35, 23, 36, 32188,
];

type ItemWithComponentId = Item & { componentId: number };

export const ItemWithHoverDetails = ({
  onClick,
  children,
  item,
  className,
}: PropsWithChildren<{
  item: Item;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  className?: string;
}>) => {
  const { data } = useFacetList();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cm(className, "relative")}
    >
      {children}
      {hovered && data != null ? (
        <div className="absolute top-full left-0 bg-white shadow-xl border border-gray-100 p-6 z-10 max-h-80 overflow-auto">
          <ul>
            {Object.entries(item.values)
              .filter(([key]) => !uselessIds.includes(Number(key)))
              .map(([key, value], i) => (
                <li key={`prp-${i}`}>
                  {data.find((f) => f.id === Number(key))?.name}:{" "}
                  <b className="font-bold" title={key}>
                    {value}
                  </b>{" "}
                </li>
              ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export const Builder = () => {
  const { data } = useFacetList();
  const [selectedItems, setSelectedItems] = useState<ItemWithComponentId[]>([]);
  // const [appliedFilters, setAppliedFilters] = useState<
  //   SelectedAdditionalFilter[]
  // >([]);
  const onSelectedChange = (componentId: number) => (item: Item | null) => {
    setSelectedItems((p) => {
      const newItems = p.filter((i) => i.componentId !== componentId);
      if (item) {
        return [...newItems, { ...item, componentId }];
      }
      return newItems;
    });
  };
  const neededPsuWatt = useMemo(() => {
    return selectedItems
      .map((item) => {
        return wattIds.reduce((sum, id) => {
          const value = item.values[id];
          if (value != null) {
            if (typeof value === "string") return sum + parseInt(value, 10);
            else return sum + value;
          }
          return sum;
        }, 0);
      })
      .reduce((sum, d) => sum + d, 0);
  }, [selectedItems]);

  const appliedFilters = useMemo(() => {
    const wattValues = wattSteps
      .filter((d) => d >= neededPsuWatt)
      .map((d) => `${d}W`);
    const wattQuery = {
      to: 6,
      id: 31986,
      value: neededPsuWatt < 500 ? "!nil" : wattValues,
    };
    return [
      wattQuery,
      ...selectedItems
        .flatMap((item) =>
          components
            .find((c) => c.id === item.componentId)
            ?.filtersToApply.flatMap((f) => {
              const value = item.values?.[f.id];
              if (f.converter) {
                const converted = f.converter(item.values);

                return converted !== undefined
                  ? converted.map((d) => ({ ...d, to: f.to }))
                  : null;
              }

              return typeof value === "string"
                ? { id: f.id, to: f.to, value }
                : null;
            })
        )
        .flat()
        .filter(isDefined),
    ];
  }, [selectedItems, neededPsuWatt]);
  const properties = useMemo(() => {
    return selectedItems
      .flatMap((item) => {
        return Object.entries(item.values).map(([key, value]) => {
          return {
            key,
            title: data?.find((d) => d.id == Number(key))?.name,
            value,
          };
        });
      })
      .filter((d) => importantFilterIds.includes(Number(d.key)));
  }, [selectedItems, data]);
  console.log(appliedFilters);
  return (
    <div className="p-2 lg:p-10 grid grid-cols-1 xl:grid-cols-[7fr,3fr] gap-6">
      <div>
        {components.map((component) => (
          <ComponentSelector
            key={component.title}
            {...component}
            selectedIds={selectedItems.map((d) => Number(d.id))}
            otherFilters={appliedFilters.filter((d) => d.to === component.id)}
            onSelectedChange={onSelectedChange(component.id)}
          />
        ))}
      </div>
      <div>
        <h2>Selected items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {selectedItems.map((item) => (
            <ItemWithHoverDetails
              key={item.id}
              item={item}
              onClick={(e) => {
                e.preventDefault();
                setSelectedItems(selectedItems.filter((d) => d.id !== item.id));
              }}
            >
              <ResultItemInner {...item} />
            </ItemWithHoverDetails>
          ))}
        </div>
        <h2>
          Summa:{" "}
          <PriceValue
            value={selectedItems.reduce(
              (sum, d) => sum + (d.values[4] ? Number(d.values[4]) : 0),
              0
            )}
            className="bold"
          />
        </h2>
        <ul>
          {properties.map((d, i) => (
            <li key={`${d.key}-${i}`}>
              {d.title}: {d.value}
            </li>
          ))}
        </ul>
        <div>
          <h2>Minimum power supply rating: {neededPsuWatt}</h2>
        </div>
      </div>
    </div>
  );
};
