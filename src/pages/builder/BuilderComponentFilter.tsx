import { useLoaderData } from "react-router-dom";
import { Facets } from "../../components/Facets";
import { Paging } from "../../components/Paging";
import { QueryMerger } from "../../components/QueryMerger";
import { ResultHeader } from "../../components/ResultHeader";
import { SearchResultList } from "../../components/SearchResultList";
import { QueryProvider } from "../../lib/hooks/QueryProvider";
import { useBuilderQuery } from "./useBuilderQuery";
import { useMemo } from "react";

export const BuilderComponentFilter = () => {
  const componentId = useLoaderData() as string | null;
  const { componentFilters, query, selectionFilters } = useBuilderQuery(
    Number(componentId)
  );
  const [facetsToHide, facetsToDisable] = useMemo(() => {
    return [
      Array.from(
        new Set([
          10,
          11,
          12,
          13,
          ...(componentFilters?.string ?? []).map((d) => d.id),
          ...(componentFilters?.range ?? []).map((d) => d.id),
        ])
      ),
      selectionFilters?.map((d) => d.id) ?? [],
    ];
  }, [componentFilters, selectionFilters]);

  if (!query) {
    return <div>Loading</div>;
  }
  return (
    <QueryProvider initialQuery={query}>
      <QueryMerger query={query} />
      <div className="px-4 py-3 md:py-8 md:px-10">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <Facets
            facetsToHide={facetsToHide}
            hideCategories
            facetsToDisable={facetsToDisable}
          />

          <main className="flex-1 container">
            <ResultHeader />
            <SearchResultList />
            <Paging />
          </main>
        </div>
      </div>
    </QueryProvider>
  );
};
