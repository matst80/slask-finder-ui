import { Link, useLoaderData } from "react-router-dom";
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
import { FilteringQuery, ItemValues } from "../../lib/types";
import { useBuilderContext } from "./useBuilderContext";
import { cm } from "../../utils";
import { Issue } from "./builder-types";
import { IssueList } from "./IssueList";
import { NextComponentButton } from "./NextComponentButton";

const ComponentResultList = ({
  componentId,
  validator,
}: {
  componentId: number;
  validator?: (values: ItemValues) => Issue[];
}) => {
  const { isLoading, hits } = useQuery();
  const { selectedItems } = useBuilderContext();
  // const navigate = useNavigate();

  // const start = (page ?? 0) * (pageSize ?? 40);
  if (isLoading && hits.length < 1) {
    return <div>Loading...</div>;
  }

  const selectedId = selectedItems.find(
    (i) => i.componentId === componentId
  )?.id;

  // const handleSelection =
  //   (item: Item, idx: number): React.MouseEventHandler<HTMLAnchorElement> =>
  //   (e) => {
  //     const { id } = item;

  //     const issues = validator?.(item.values) ?? [];
  //     if (issues.filter((d) => d.type === "error").length > 0) {
  //       return;
  //     }
  //     e.preventDefault();
  //     const parentId = new URLSearchParams(globalThis.location.search).get(
  //       "parentId"
  //     );

  //     setSelectedItems((p) => {
  //       const isSelected = p.some((i) => i.id === id);
  //       const newItems = p.filter((i) => i.componentId !== componentId);
  //       if (item && !isSelected) {
  //         return [
  //           ...newItems,
  //           {
  //             ...item,
  //             componentId,
  //             parentId: parentId != null ? Number(parentId) : undefined,
  //           },
  //         ];
  //       }
  //       return newItems;
  //     });
  //     requestAnimationFrame(() => {
  //       trackClick(id, idx);
  //       trackAction({
  //         item: id,
  //         action: "select_component",
  //         reason: `builder_${componentId}`,
  //       });
  //     });
  //   };

  if (!hits.length && (hits == null || hits.length < 1)) {
    return <div>No matching components</div>;
  }
  return (
    <ImpressionProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 -mx-4 md:-mx-0">
        {hits?.map((item) => {
          const issues = validator?.(item.values) ?? [];
          const hasError = issues.some((d) => d.type === "error");
          const isValid = issues.length === 0;
          return (
            <Link
              to={`/builder/product/${componentId}/${item.id}`}
              //onClick={handleSelection(item, start + idx)}
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
                <ResultItemInner key={item.id} {...item} />
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
      <div className="px-4 py-3 md:py-8 md:px-10 mb-24 max-w-[1920px] mx-auto">
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
