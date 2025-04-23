import { useLoaderData } from "react-router-dom";
import { Facets } from "../../components/Facets";
import { Paging } from "../../components/Paging";
import { QueryUpdater } from "../../components/QueryMerger";
import { ResultHeader } from "../../components/ResultHeader";
import { QueryProvider } from "../../lib/hooks/QueryProvider";
import { useBuilderQuery } from "./useBuilderQuery";
import { useMemo, useState } from "react";
import { BuilderFooterBar } from "./components/BuilderFooterBar";
import { ResultItemInner } from "../../components/ResultItem";
import { useQuery } from "../../lib/hooks/useQuery";
import { ImpressionProvider } from "../../lib/hooks/ImpressionProvider";
import { Item } from "../../lib/types";
import { trackClick } from "../../lib/datalayer/beacons";
import { useBuilderContext } from "./useBuilderContext";
import { cm } from "../../utils";
import { ButtonLink } from "../../components/ui/button";

import { GroupRenderer } from "./components/ItemDetails";
import { X } from "lucide-react";

const DetailsDialog = ({ item }: { item: Item }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>show details</button>
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-screen-lg max-h-[80vh] animate-cart-open"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{item.title}</h2>
              <button
                onClick={() => setOpen(false)}
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

  const selectedId = selectedItems.find(
    (i) => i.componentId === componentId
  )?.id;

  const handleSelection = (item: Item, idx: number) => () => {
    const { id } = item;
    trackClick(id, idx);
    setSelectedItems((p) => {
      const newItems = p.filter((i) => i.componentId !== componentId);
      if (item) {
        return [...newItems, { ...item, componentId }];
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
          <button
            onClick={handleSelection(item, start + idx)}
            key={item.id}
            className={cm(
              "group bg-white md:shadow-sm text-left hover:shadow-md transition-all duration-300 overflow-hidden relative snap-start flex-1 min-w-64 flex flex-col result-item bg-gradient-to-br border-b border-gray-200 md:border-b-0",
              selectedId === item.id
                ? "from-blue-100 hover:from-blue-200"
                : "hover:from-white to-gray-50 hover:to-gray-10"
            )}
          >
            <ResultItemInner key={item.id} {...item}>
              <DetailsDialog item={item} />
            </ResultItemInner>
          </button>
        ))}
      </div>
    </ImpressionProvider>
  );
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
  const nextComponent = useMemo(() => {
    const currentIdx = order.findIndex((id) => id === componentId);

    const selectedIds = new Set([
      ...selectedItems.map((d) => d.componentId),
      ...rules
        .filter((d) => d.disabled != null && d.disabled(selectedItems))
        .map((d) => d.id),
    ]);

    return rules.find(
      (d) =>
        d.id ==
        order.find(
          (id, idx) =>
            id !== componentId && !selectedIds.has(id) && idx > currentIdx
        )
    );
  }, [order, componentId, selectedItems, rules]);
  return hasSelection ? (
    <ButtonLink
      to={
        nextComponent
          ? `/builder/${nextComponent.type}/${nextComponent.id}`
          : "/builder/overview"
      }
      onClick={() => {
        setSelectedComponentId(nextComponent?.id);
      }}
    >
      {nextComponent == null ? `Overview` : `Next (${nextComponent?.title})`}
    </ButtonLink>
  ) : null;
};

export const BuilderComponentFilter = () => {
  const componentId = useLoaderData() as string | null;

  const { component, query, selectionFilters } = useBuilderQuery(
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

  if (!query) {
    return <div>Loading</div>;
  }
  return (
    <QueryProvider initialQuery={query} key={componentId}>
      <QueryUpdater query={query} />
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
