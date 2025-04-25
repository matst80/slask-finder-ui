import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { Facets } from "../../components/Facets";
import { Paging } from "../../components/Paging";
import { ResultHeader } from "../../components/ResultHeader";
import { QueryProvider } from "../../lib/hooks/QueryProvider";
import { useBuilderQuery } from "./useBuilderQuery";
import { useEffect, useMemo, useRef } from "react";
import { BuilderFooterBar } from "./components/BuilderFooterBar";
import { ResultItemInner } from "../../components/ResultItem";
import { useQuery } from "../../lib/hooks/useQuery";
import { ImpressionProvider } from "../../lib/hooks/ImpressionProvider";
import { FilteringQuery, Item, ItemValues } from "../../lib/types";
import { trackAction, trackClick } from "../../lib/datalayer/beacons";
import { useBuilderContext } from "./useBuilderContext";
import { cm } from "../../utils";
import { Button, ButtonLink } from "../../components/ui/button";
import { Issue } from "./builder-types";
import { useBuilderStep } from "./useBuilderStep";
import { IssueList } from "./IssueList";

const ComponentResultList = ({
  componentId,
  validator,
}: {
  componentId: number;
  validator?: (values: ItemValues) => Issue[];
}) => {
  const {
    isLoading,
    hits,
    query: { page, pageSize },
  } = useQuery();
  const { setSelectedItems, selectedItems } = useBuilderContext();
  const navigate = useNavigate();

  const start = (page ?? 0) * (pageSize ?? 40);
  if (isLoading && hits.length < 1) {
    return <div>Loading...</div>;
  }

  const selectedId = selectedItems.find(
    (i) => i.componentId === componentId
  )?.id;

  const handleSelection =
    (item: Item, idx: number): React.MouseEventHandler<HTMLAnchorElement> =>
    (e) => {
      const { id } = item;

      const issues = validator?.(item.values) ?? [];
      if (issues.filter((d) => d.type === "error").length > 0) {
        return;
      }
      e.preventDefault();
      const parentId = new URLSearchParams(globalThis.location.search).get(
        "parentId"
      );

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
      requestAnimationFrame(() => {
        trackClick(id, idx);
        trackAction({
          item: id,
          action: "select_component",
          reason: `builder_${componentId}`,
        });
      });
    };

  if (!hits.length && (hits == null || hits.length < 1)) {
    return <div>No matching components</div>;
  }
  return (
    <ImpressionProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 -mx-4 md:-mx-0">
        {hits?.map((item, idx) => {
          const issues = validator?.(item.values) ?? [];
          const hasError = issues.some((d) => d.type === "error");
          const isValid = issues.length === 0;
          return (
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
              <div
                className={
                  isValid
                    ? "opacity-100"
                    : hasError
                    ? "opacity-50"
                    : "opacity-75"
                }
              >
                <ResultItemInner key={item.id} {...item}>
                  {/* <DetailsDialog item={item} /> */}
                  <Button
                    variant={"outline"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigate(`/product/${item.id}`, { viewTransition: true });
                      trackAction({
                        item: item.id,
                        action: "details",
                        reason: `builder_${componentId}`,
                      });
                    }}
                  >
                    Show details
                  </Button>
                </ResultItemInner>
              </div>
              <IssueList issues={issues} />
            </Link>
          );
        })}
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

    keyRef.current = componentId;
    setQuery(query);
  }, [query, setQuery, componentId]);
  return null;
};

const NextComponentButton = ({ componentId }: { componentId: number }) => {
  const { selectedItems } = useBuilderContext();
  const hasSelection = useMemo(
    () =>
      selectedItems.length > 0 &&
      componentId != null &&
      selectedItems.some((d) => d.componentId === componentId),
    [selectedItems, componentId]
  );
  const [unselectedComponents, nextComponent] = useBuilderStep(componentId);

  return (
    <div className="group flex relative">
      {unselectedComponents.length > 1 && (
        <div className="absolute -bottom-0 mb-11 bg-white p-4 rounded-lg shadow-xl flex flex-col gap-2 opacity-0 group-hover:animate-pop-fast group-hover:opacity-100 transition-all duration-200 w-72 z-10 border border-gray-100">
          <div className="text-sm font-medium text-gray-500 border-b pb-2 mb-1">
            Other Components
          </div>
          <div className="max-h-[300px] overflow-y-auto flex flex-col gap-1.5">
            {unselectedComponents
              .filter((d) => d.id !== componentId)
              .map((d) => (
                <Link
                  to={`/builder/${d.type}/${d.id}`}
                  className="px-3 py-2 rounded-md bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-800 transition-colors duration-200 flex items-center"
                  key={d.id}
                >
                  <span className="truncate">{d.title}</span>
                </Link>
              ))}
          </div>
        </div>
      )}
      <ButtonLink
        to={
          nextComponent
            ? `/builder/${nextComponent.type}/${nextComponent.id}`
            : "/builder/overview"
        }
        variant={hasSelection ? "default" : "outline"}
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
    <QueryProvider initialQuery={requiredQuery} ignoreFacets={facetsToHide}>
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
            <ComponentResultList
              componentId={Number(componentId)}
              validator={component?.validator}
            />
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
