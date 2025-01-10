import { useMemo, useState } from "react";
import { useFacetList, useFacets, useItemsSearch } from "../hooks/searchHooks";
import { FilteringQuery, Item, ItemsQuery, ItemValues } from "../types";
import { ResultItem } from "./ResultItem";
import { isDefined } from "../utils";
import { PriceValue } from "./Price";
import { FacetList } from "./facets/Facets";

type AdditionalFilter = {
  id: number;
  to: number;
  converter?: (value: ItemValues) => {
    id: number;
    value: string | string[];
  }[];
};

type Component = {
  title: string;
  id: number;
  filtersToApply: AdditionalFilter[];
  filter: ItemsQuery;
};

type SelectedAdditionalFilter = AdditionalFilter & { value: string | string[] };

const importantFilterIds = [
  31187, 36209, 35989, 35990, 35922, 35978, 32073, 31009, 30634, 31991, 32186,
  36261, 36245, 32161, 33514, 36224, 36225, 36226, 36227, 36228, 36229, 36230,
  36231, 36232, 36233, 36234, 36235, 36236, 36237, 36238, 36239, 31396, 36268,
  36252, 36284, 31986, 32057, 31190, 30857, 36211, 32183, 33531, 33574, 33575,
  33533, 33576, 33577, 34582, 34583, 36301, 30007, 36302,
];
const wattIds = [35990, 32186];

const components: Component[] = [
  {
    title: "CPU",
    id: 1,
    filtersToApply: [{ id: 32103, to: 2 }],
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 40,
      stock: [],
      string: [
        {
          id: 11,
          value: "Datorkomponenter",
        },
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
    filtersToApply: [
      { id: 32103, to: 1 }, // cpu socket
      { id: 35921, to: 3 }, // ram type
      { id: 30857, to: 3 }, // ram pins
      {
        id: 36249,
        to: 4,
        converter: (values) => {
          // m2 slots and gen
          const m2Slots = Number(values[36245]);
          const ret = [];
          if (m2Slots > 0) {
            const gen = values[36211];
            if (gen != null && typeof gen === "string") {
              const genNr = Number(gen.split(".")[0]);
              const values = [];
              for (let i = 1; i <= genNr; i++) {
                values.push(`${i}.0`);
              }
              ret.push({ id: 36249, value: values });
            }
          }
          return ret;
        },
      },
      {
        id: 30552,
        to: 7,
        converter: (values) => {
          console.log(values);
          const formFactor = values[30552];
          const allowed = [];
          if (typeof formFactor === "string") {
            if (formFactor.includes("Mini")) {
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
    ],
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 40,
      stock: [],
      string: [
        {
          id: 11,
          value: "Datorkomponenter",
        },
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
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 40,
      stock: [],
      string: [
        {
          id: 11,
          value: "Datorkomponenter",
        },
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
        {
          id: 11,
          value: "Datorkomponenter",
        },
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
    filtersToApply: [],
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 40,
      stock: [],
      string: [
        {
          id: 11,
          value: "Datorkomponenter",
        },
        {
          id: 31158,
          value: "Grafikkort",
        },
      ],
    },
  },
  {
    title: "Nätaggregat",
    id: 6,
    filtersToApply: [],
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 40,
      stock: [],
      string: [
        {
          id: 11,
          value: "Datorkomponenter",
        },
        {
          id: 31158,
          value: "Nätaggregat (PSU)",
        },
      ],
    },
  },
  {
    title: "Chassi",
    filtersToApply: [
      //  { id: 30552, to: 2 }
    ],
    id: 7,
    filter: {
      range: [],
      sort: "popular",
      page: 0,
      pageSize: 40,
      stock: [],
      string: [
        {
          id: 11,
          value: "Datorkomponenter",
        },
        {
          id: 31158,
          value: "Chassi",
        },
      ],
    },
  },
];

const ToggleResultItem = ({
  selected,
  ...item
}: Item & { position: number; selected: boolean } & OnSelectedItem) => {
  return (
    <div key={item.id} className={selected ? "border-red-500 border" : ""}>
      <ResultItem
        {...item}
        onClick={(e) => {
          e.preventDefault();
          item.onSelectedChange(selected ? null : item);
        }}
      />
    </div>
  );
};

type OnSelectedItem = { onSelectedChange: (data: Item | null) => void };
type ComponentSelectorProps = Component &
  OnSelectedItem & {
    otherFilters: SelectedAdditionalFilter[];
  };

const ComponentSelector = ({
  title,
  filter,
  otherFilters,
  onSelectedChange,
}: ComponentSelectorProps) => {
  const [userFiler, setUserFilter] = useState<
    Pick<FilteringQuery, "range" | "string">
  >({ range: [], string: [] });
  const baseQuery = {
    ...filter,
    range: [...(filter.range ?? []), ...(userFiler.range ?? [])],
    
    string: [
      //{id:3,value:"!0"},
      ...otherFilters,
      ...(filter.string ?? []),
      ...(userFiler.string ?? []),
    ],
  } satisfies FilteringQuery;
  const { data } = useItemsSearch(baseQuery);
  const facetResult = useFacets(baseQuery);
  const [selected, setSelected] = useState<number | string>();
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-400 rounded-md p-4 mb-4">
      <button className="text-xl" onClick={() => setOpen((p) => !p)}>
        {title} ({data?.totalHits ?? "Loading..."}){" "}
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-4">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 m-6">
            {data?.items.map((item, idx) => (
              <ToggleResultItem
                key={item.id}
                {...item}
                selected={selected === item.id}
                position={idx}
                onSelectedChange={(data) => {
                  setSelected(data ? data.id : undefined);
                  if (data) {
                    setOpen(false);
                  }
                  onSelectedChange(data);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const wattSteps = [100, 200, 300, 400, 500, 600, 700, 750, 800, 850, 900, 1000, 1200];

type ItemWithComponentId = Item & { componentId: number };

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
  console.log(neededPsuWatt);
  const appliedFilters = useMemo(() => {
    const wattValues = wattSteps.filter((d) => d >= neededPsuWatt).map((d) => `${d}W`);
    const wattQuery = { to: 6, id: 31986, value: wattValues };
    return [wattQuery,...selectedItems
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
      .filter(isDefined)];
  }, [selectedItems,neededPsuWatt]);
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
            otherFilters={appliedFilters.filter((d) => d.to === component.id)}
            onSelectedChange={onSelectedChange(component.id)}
          />
        ))}
      </div>
      <div>
        <h2>Selected items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {selectedItems.map((item, i) => (
            <ResultItem
              key={item.id}
              {...item}
              position={i}
              onClick={(e) => {
                e.preventDefault();
                setSelectedItems(selectedItems.filter((d) => d.id !== item.id));
              }}
            />
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
          {properties.map((d) => (
            <li key={d.key}>
              {d.title}: {d.value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
