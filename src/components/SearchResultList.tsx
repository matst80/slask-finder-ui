import { useEffect, useMemo, useRef, useState } from "react";
import { useCategories } from "../categoryHooks";
import { Category, FacetListItem } from "../types";
import { ResultItem } from "./ResultItem";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  SquareMinus,
  SquarePlus,
  Trash,
} from "lucide-react";
import {
  useFacetList,
  useFilters,
  useHashQuery,
  useHashResultItems,
} from "../searchHooks";
import { Impression, trackImpression } from "../beacons";
import { Button, ButtonLink } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";
import { Link } from "react-router-dom";
import { byPriority } from "../utils";
import { useFieldValues } from "../adminHooks";
import { Input } from "./ui/input";
import useSWR from "swr";
import {
  getPopularity,
  getStaticPositions,
  setStaticPositions,
  updatePopularity,
} from "../api";
import useSWRMutation from "swr/mutation";

const textSize = (level: number) => {
  switch (level) {
    case 1:
      return "text-xl";
    case 2:
      return "text-lg";
    case 3:
      return "text-base";
    default:
      return "text-sm";
  }
};

const byName = (a: Category, b: Category) => a.value.localeCompare(b.value);

const CategoryItem = ({
  value,
  children,
  level,
  defaultOpen = false,
}: Category & { level: number; defaultOpen?: boolean }) => {
  const { addKeyFilter } = useFilters();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <li>
      <div className="flex gap-4 items-center">
        <button onClick={() => setOpen((p) => !p)}>
          {open ? (
            <SquareMinus className="size-5" color="gray" />
          ) : children?.length ? (
            <SquarePlus className="size-5" color="gray" />
          ) : (
            <div className="size-5"></div>
          )}
        </button>
        <button
          className={textSize(level)}
          onClick={() => addKeyFilter(9 + level, value)}
        >
          {value}
        </button>
      </div>
      {open && (
        <ul className="pl-4">
          {children &&
            children
              .sort(byName)
              .map((child: Category) => (
                <CategoryItem key={child.value} {...child} level={level + 1} />
              ))}
        </ul>
      )}
    </li>
  );
};

const searchList = [
  {
    title: "I lager i falun",
    href: "#stock=2299&page=0",
  },
  {
    title: "Alla produkter",
    href: "#i=4%3D1-99999999900",
  },
  {
    title: "Rabatterade produkter",
    href: "#i=5%3D1-99999999900",
  },
];

const NoResults = () => {
  const { data } = useCategories();
  return (
    <div>
      <ul className="mt-2">
        {data?.sort(byName).map((category, idx) => (
          <CategoryItem
            key={category.value}
            {...category}
            level={1}
            defaultOpen={idx < 3}
          />
        ))}
      </ul>
      <div className="flex gap-4 mt-6">
        {searchList.map(({ title, href }) => (
          <ButtonLink href={href}>{title}</ButtonLink>
        ))}
      </div>
    </div>
  );
};

export const SearchResultList = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { data: results, isLoading: loadingItems } = useHashResultItems();
  const {
    query: { page, pageSize, query },
  } = useHashQuery();

  useEffect(() => {
    const impressions = new Set<number>();
    let toPush: Impression[] = [];
    if (ref.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries
            .filter((d) => d.isIntersecting)
            .forEach((entry) => {
              const target = entry.target as HTMLElement;
              const id = Number(target.dataset.id);
              const position = Number(target.dataset.position);
              if (id != null && !isNaN(position)) {
                if (!impressions.has(id)) {
                  toPush.push({ id, position });
                  impressions.add(id);
                }
              }
            });
          if (toPush.length) {
            trackImpression(toPush);
            toPush = [];
          }
        },
        { threshold: 1 }
      );
      ref.current.querySelectorAll(".result-item").forEach((item) => {
        observer.observe(item);
      });
      return () => observer.disconnect();
    }
  }, [results, ref]);

  const start = (page ?? 0) * (pageSize ?? 40);
  if (loadingItems && (!results || !results.length)) {
    return <div>Loading...</div>;
  }

  if (!results || (!results.length && (query == null || query.length < 1))) {
    return <NoResults />;
  }
  return (
    <div
      ref={ref}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
    >
      {results?.map((item, idx) => (
        <ResultItem key={item.id} {...item} position={start + idx} />
      ))}
    </div>
  );
};

export const CategoryList = () => {
  const { data } = useCategories();
  return (
    <div>
      <ul>
        {data?.sort(byName).map((category) => (
          <CategoryItem key={category.value} {...category} level={1} />
        ))}
      </ul>
    </div>
  );
};

const FacetValues = ({ id }: { id: number }) => {
  const { data: values } = useFieldValues(id);
  return (
    <ul>
      {values?.map((value) => (
        <li key={value}>{value}</li>
      ))}
    </ul>
  );
};

export const AdminFacet = (facet: FacetListItem) => {
  const [open, setOpen] = useState(false);
  const isKeyFacet = facet.fieldType === "key";
  return (
    <>
      <div className="grid grid-cols-subgrid col-span-full border-b border-gray-100 p-4">
        <div>
          <button
            className="font-medium bold"
            onClick={() => setOpen((p) => !p)}
          >
            {facet.name} ({isKeyFacet ? "" : "max-min: "}
            {facet.count})
            {isKeyFacet && (
              <>
                {open ? (
                  <ChevronUp className="size-4 inline ml-2" />
                ) : (
                  <ChevronDown className="size-4 inline ml-2" />
                )}
              </>
            )}
          </button>
        </div>
        <span>
          <Input defaultValue={facet.type} />
        </span>
        <span>
          <select value={facet.sort}>
            <option>By number of hits</option>
            <option>Name</option>
          </select>
        </span>
        <Input defaultValue={facet.prio} type="number" />
      </div>
      {isKeyFacet && open && (
        <div className="grid grid-cols-subgrid col-span-full border-b border-gray-100 p-4">
          <FacetValues id={facet.id} />
        </div>
      )}
    </>
  );
};

export const AllFacets = () => {
  const { data: facets } = useFacetList();
  return (
    <div className="container">
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 grid grid-cols-4 gap-3">
        <div className="grid grid-cols-subgrid col-span-full border-b border-gray-300 p-4 font-bold">
          <div>Name</div>
          <div>Type</div>
          <div>Sort</div>
          <div>Priority</div>
        </div>
        {facets?.sort(byPriority).map((facet) => (
          <AdminFacet key={facet.id} {...facet} />
        ))}
      </div>
    </div>
  );
};

const invertEntries = (data: Record<string, number>) => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [Number(value), Number(key)])
  );
};

const useStaticPositions = () => {
  const [dirty, setDirty] = useState(false);
  const { data, mutate } = useSWR("/admin/sort/static", () =>
    getStaticPositions().then(invertEntries)
  );
  const { trigger } = useSWRMutation(
    "/admin/sort/static",
    (_: string, { arg }: { arg: Record<number, number> }) =>
      setStaticPositions(arg)
  );
  return {
    positions: data ?? {},
    setItemPosition: (id: number, pos: number) => {
      mutate((prev) => ({ ...prev, [id]: pos }), false);
      //setPositions((prev) => ({ ...prev, [id]: pos }));
      setDirty(true);
    },
    isDirty: dirty,
    save: () => {
      if (dirty && data != null) {
        setDirty(false);
        trigger(invertEntries(data));
      }
    },
  };
};

const usePopularity = () => {
  const [dirty, setDirty] = useState(false);
  const { data, mutate } = useSWR("/admin/popular", getPopularity);
  const { trigger } = useSWRMutation(
    "/admin/popular",
    (_: string, { arg }: { arg: Record<number, number> }) =>
      updatePopularity(arg)
  );
  return {
    popular: data ?? {},
    setItemPopularity: (id: number, pos: number) => {
      mutate((prev) => ({ ...prev, [id]: pos }), false);
      setDirty(true);
    },
    isDirty: dirty,
    save: () => {
      if (dirty && data != null) {
        setDirty(false);
        trigger(data);
      }
    },
  };
};

export const TableSearchResultList = () => {
  const { data: results, isLoading: loadingItems } = useHashResultItems();
  const {
    popular,
    setItemPopularity,
    isDirty: isDirtyPopular,
    save: savePopular,
  } = usePopularity();
  const {
    positions,
    setItemPosition,
    isDirty: isDirtyPositions,
    save: savePositions,
  } = useStaticPositions();
  const {
    query: { query },
  } = useHashQuery();
  const { data } = useFacetList();
  const virtualCategories = useMemo(
    () => data?.filter((facet) => facet.type === "virtual"),
    [data]
  );

  //const start = (page ?? 0) * (pageSize ?? 40);
  if (loadingItems && (!results || !results.length)) {
    return <div>Loading...</div>;
  }

  if (!results || (!results.length && (query == null || query.length < 1))) {
    return <CategoryList />;
  }
  return (
    <form>
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Select</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Popularity</TableHead>
              <TableHead>Static position</TableHead>
              {virtualCategories?.map((category) => (
                <TableHead key={`vcat-${category.id}`}>
                  {category.name}
                </TableHead>
              ))}
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox name={product.id} />
                </TableCell>
                <TableCell className="font-bold">{product.title}</TableCell>
                <TableCell>{product.values["10"]}</TableCell>
                <TableCell>
                  <Input
                    value={popular[Number(product.id)] ?? 0}
                    onChange={(e) => {
                      setItemPopularity(
                        Number(product.id),
                        Number(e.target.value)
                      );
                    }}
                    className="w-14"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={positions[Number(product.id)] ?? 0}
                    onChange={(e) => {
                      setItemPosition(
                        Number(product.id),
                        Number(e.target.value)
                      );
                    }}
                    className="w-14"
                  />
                </TableCell>
                {virtualCategories?.map((category) => (
                  <TableCell key={`vcat-${category.id}-${product.id}`}>
                    <Input
                      defaultValue={product.values[category.id]}
                      className="w-24"
                      name={`${category.id}-${product.id}`}
                    />
                  </TableCell>
                ))}
                <TableCell>{product.values["4"].toFixed(2)}</TableCell>
                <TableCell>{product.stockLevel ?? "0"}</TableCell>
                <TableCell className="justify-end flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Link to={`/edit/product/${product.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex gap-2">
          <Button
            disabled={!isDirtyPopular}
            onClick={() => {
              savePopular();
            }}
          >
            Save popular
          </Button>
          <Button
            disabled={!isDirtyPositions}
            onClick={() => {
              savePositions();
            }}
          >
            Save static positions
          </Button>
        </div>
      </div>
    </form>
  );
};
