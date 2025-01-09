import { useState } from "react";
import { useItemsSearch } from "../hooks/searchHooks";
import { Item, ItemsQuery, ItemValues } from "../types";
import { ResultItem } from "./ResultItem";
import { isDefined } from "../utils";

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
          item.onSelectedChange(selected ? null : item.values);
        }}
      />
    </div>
  );
};

type OnSelectedItem = { onSelectedChange: (data: ItemValues | null) => void };
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
    <div>
      <h2 className="text-xl" onClick={() => setOpen((p) => !p)}>{title} ({data?.totalHits??'Loading...'})</h2>
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

export const Builder = () => {
  const [appliedFilters, setAppliedFilters] = useState<
    SelectedAdditionalFilter[]
  >([]);
  const onSelectedChange =
    (componentId: number) => (filter: ItemValues | null) => {
      const foundValues = components
        .find((c) => c.id === componentId)
        ?.filtersToApply.map((f) => {
          const value = filter?.[f.id];
          console.log(f, value);
          return typeof value === "string"
            ? { id: f.id, to: f.to, value }
            : null;
        })
        .filter(isDefined);

      setAppliedFilters((p) => {
        const newFilters = p.filter(
          (f) => !foundValues?.some((fv) => fv.id === f.id)
        );
        if (foundValues) {
          return [...newFilters, ...foundValues];
        }
        return newFilters;
      });
    };
  return (
    <div className="p-10">
      {components.map((component) => (
        <ComponentSelector
          key={component.title}
          {...component}
          otherFilters={appliedFilters.filter((d) => d.to === component.id)}
          onSelectedChange={onSelectedChange(component.id)}
        />
      ))}
    </div>
  );
};
