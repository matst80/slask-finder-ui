import { useMemo, useState } from "react";
import { useItemsSearch } from "../hooks/searchHooks";
import { Item, ItemsQuery, ItemValues } from "../types";
import { ResultItem } from "./ResultItem";
import { isDefined } from "../utils";
import { Price, PriceValue } from "./Price";

type AdditionalFilter = { id: number; to: number };

type Component = {
  title: string;
  id: number;
  filtersToApply: AdditionalFilter[];
  filter: ItemsQuery;
};

type SelectedAdditionalFilter = AdditionalFilter & { value: string };

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
      { id: 32103, to: 1 },
      //{ id: 30552, to: 6 },
      { id: 30857, to: 3 },
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
    filtersToApply: [{ id: 30857, to: 2 }],
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
    id: 6,
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
  const { data } = useItemsSearch({
    ...filter,
    string: [...otherFilters, ...(filter.string ?? [])],
  });
  const [selected, setSelected] = useState<number | string>();
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-500 rounded-md p-4 mb-4">
      <button className="text-xl" onClick={() => setOpen((p) => !p)}>
        {title} ({data?.totalHits ?? "Loading..."}) <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 m-6">
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
      )}
    </div>
  );
};

type ItemWithComponentId = Item & { componentId: number };

export const Builder = () => {
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
  const appliedFilters = useMemo(() => {
    return selectedItems
      .flatMap((item) =>
        components
          .find((c) => c.id === item.componentId)
          ?.filtersToApply.map((f) => {
            const value = item.values?.[f.id];
            return typeof value === "string"
              ? { id: f.id, to: f.to, value }
              : null;
          })
      )
      .flat()
      .filter(isDefined);
  }, [selectedItems]);
  return (
    <div className="p-10 grid grid-cols-[2fr,1fr] gap-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>
    </div>
  );
};
