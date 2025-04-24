import { Link, useLoaderData } from "react-router-dom";
import { Facets } from "../../components/Facets";
import { Paging } from "../../components/Paging";
import { ResultHeader } from "../../components/ResultHeader";
import { QueryProvider } from "../../lib/hooks/QueryProvider";
import { useBuilderQuery } from "./useBuilderQuery";
import { useEffect, useMemo, useRef, useState } from "react";
import { BuilderFooterBar } from "./components/BuilderFooterBar";
import { ResultItemInner } from "../../components/ResultItem";
import { useQuery } from "../../lib/hooks/useQuery";
import { ImpressionProvider } from "../../lib/hooks/ImpressionProvider";
import { FilteringQuery, Item } from "../../lib/types";
import { trackClick } from "../../lib/datalayer/beacons";
import { useBuilderContext } from "./useBuilderContext";
import { cm, isDefined } from "../../utils";
import { ButtonLink } from "../../components/ui/button";

import { GroupRenderer } from "./components/ItemDetails";
import { X } from "lucide-react";

const DetailsDialog = ({ item }: { item: Item }) => {
  const [open, setOpen] = useState(false);
  const close: React.MouseEventHandler<HTMLDivElement | HTMLButtonElement> = (
    e
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(false);
  };
  return (
    <>
      <button onClick={() => setOpen(true)}>show details</button>
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={close}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-(--breakpoint-lg) max-h-[80vh] animate-cart-open"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{item.title}</h2>
              <button
                onClick={close}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <GroupRenderer values={item.values} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ComponentResultList = ({ componentId }: { componentId: number }) => {
  const {
    isLoading,
    hits,
    query: { page, pageSize },
  } = useQuery();
  const { setSelectedItems, selectedItems } = useBuilderContext();

  const start = (page ?? 0) * (pageSize ?? 40);
  if (isLoading && hits.length < 1) {
    return <div>Loading...</div>;
  }

  const parentId = new URLSearchParams(globalThis.location.search).get(
    "parentId"
  );

  const selectedId = selectedItems.find(
    (i) => i.componentId === componentId
  )?.id;

  const handleSelection =
    (item: Item, idx: number): React.MouseEventHandler<HTMLAnchorElement> =>
    (e) => {
      e.preventDefault();
      const { id } = item;
      trackClick(id, idx);

      setSelectedItems((p) => {
        const isSelected = p.some((i) => i.id === id);
        const newItems = p.filter((i) => i.componentId !== componentId);
        if (item && !isSelected) {
          return [
            ...newItems,
            {
              ...item,
              componentId,
              parentId: parentId != null ? Number(parentId) : undefined,
            },
          ];
        }
        return newItems;
      });
    };

  if (!hits.length && (hits == null || hits.length < 1)) {
    return <div>No matching components</div>;
  }
  return (
    <ImpressionProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 -mx-4 md:-mx-0">
        {hits?.map((item, idx) => (
          <Link
            to={`/product/${item.id}`}
            onClick={handleSelection(item, start + idx)}
            key={item.id}
            className={cm(
              "group bg-white md:shadow-xs text-left hover:shadow-md transition-all duration-300 overflow-hidden relative snap-start flex-1 min-w-64 flex flex-col result-item bg-linear-to-br border-b border-gray-200 md:border-b-0",
              selectedId === item.id
                ? "from-blue-100 hover:from-blue-200"
                : "hover:from-white to-gray-50 hover:to-gray-10"
            )}
          >
            <ResultItemInner key={item.id} {...item}>
              <DetailsDialog item={item} />
            </ResultItemInner>
          </Link>
        ))}
      </div>
    </ImpressionProvider>
  );
};

const BuilderQueryMerger = ({
  query,
  componentId,
}: {
  query: FilteringQuery;
  componentId: string | number | null;
}) => {
  const { setQuery } = useQuery();
  const keyRef = useRef<string | number | null>(componentId);
  useEffect(() => {
    if (keyRef.current === componentId) {
      return;
    }
    console.log("updating query", componentId, query);
    keyRef.current = componentId;
    setQuery(query);
  }, [query, setQuery, componentId]);
  return null;
};

const NextComponentButton = ({ componentId }: { componentId: number }) => {
  const { selectedItems, order, rules, setSelectedComponentId } =
    useBuilderContext();
  const hasSelection = useMemo(
    () =>
      selectedItems.length > 0 &&
      componentId != null &&
      selectedItems.some((d) => d.componentId === componentId),
    [selectedItems, componentId]
  );
  const [unselectedComponents, nextComponent] = useMemo(() => {
    const currentIdx = order.findIndex((id) => id === componentId);

    const selectedIds = new Set([
      ...selectedItems.flatMap((d) =>
        [d.componentId, d.parentId].filter(isDefined)
      ),
      ...rules
        .filter((d) => d.disabled != null && d.disabled(selectedItems))
        .map((d) => d.id),
    ]);

    const unselected = order
      .filter((id) => {
        return !selectedIds.has(id);
      })
      .map((id) => {
        const rule = rules.find((d) => d.id === id);
        return rule != null &&
          (rule.disabled == null || !rule.disabled(selectedItems))
          ? rule
          : null;
      })
      .filter(isDefined);

    return [
      unselected,
      rules.find(
        (d) =>
          d.id ==
          order.find(
            (id, idx) =>
              id !== componentId && !selectedIds.has(id) && idx > currentIdx
          )
      ) ?? unselected[0],
    ];
  }, [order, componentId, selectedItems, rules]);
  return (
    <div className="group flex relative">
      <div className="absolute -bottom-0 mb-11 bg-white p-4 rounded-lg shadow-xl flex flex-col gap-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-72 z-10 border border-gray-100">
        <div className="text-sm font-medium text-gray-500 border-b pb-2 mb-1">
          Other Components
        </div>
        <div className="max-h-[300px] overflow-y-auto flex flex-col gap-1.5">
          {unselectedComponents
            .filter((d) => d.id !== nextComponent?.id)
            .map((d) => (
              <Link
                to={`/builder/${d.type}/${d.id}`}
                className="px-3 py-2 rounded-md bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-800 transition-colors duration-200 flex items-center"
                key={d.id}
                onClick={() => setSelectedComponentId(d.id)}
              >
                <span className="truncate">{d.title}</span>
              </Link>
            ))}
        </div>
        {unselectedComponents.length <= 1 && (
          <div className="text-xs text-gray-400 italic">
            No other components available
          </div>
        )}
      </div>
      <ButtonLink
        to={
          nextComponent
            ? `/builder/${nextComponent.type}/${nextComponent.id}`
            : "/builder/overview"
        }
        variant={hasSelection ? "default" : "outline"}
        onClick={() => {
          setSelectedComponentId(nextComponent?.id);
        }}
      >
        {nextComponent == null ? `Overview` : `Next (${nextComponent?.title})`}
      </ButtonLink>
    </div>
  );
};

export const BuilderComponentFilter = () => {
  const componentId = useLoaderData() as string | null;

  const { component, requiredQuery, selectionFilters } = useBuilderQuery(
    Number(componentId)
  );
  const [facetsToHide, facetsToDisable] = useMemo(() => {
    const { filter } = component ?? {};
    return [
      Array.from(
        new Set([
          10,
          11,
          12,
          13,
          ...(filter?.string ?? []).map((d) => d.id),
          ...(filter?.range ?? []).map((d) => d.id),
        ])
      ),
      selectionFilters?.map((d) => d.id) ?? [],
    ];
  }, [component, selectionFilters]);

  if (!requiredQuery) {
    return <div>Loading</div>;
  }
  return (
    <QueryProvider initialQuery={requiredQuery}>
      <BuilderQueryMerger query={requiredQuery} componentId={componentId} />
      <div className="px-4 py-3 md:py-8 md:px-10 mb-24">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <Facets
            facetsToHide={facetsToHide}
            hideCategories
            facetsToDisable={facetsToDisable}
          />

          <main className="flex-1 container">
            <ResultHeader />
            <ComponentResultList componentId={Number(componentId)} />
            <Paging />
          </main>
        </div>
      </div>
      <BuilderFooterBar>
        <NextComponentButton componentId={Number(componentId)} />
      </BuilderFooterBar>
    </QueryProvider>
  );
};
