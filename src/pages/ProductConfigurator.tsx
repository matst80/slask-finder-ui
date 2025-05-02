import { QueryProvider } from "../lib/hooks/QueryProvider";
import { SearchResultList } from "../components/SearchResultList";
import { useQuery } from "../lib/hooks/useQuery";
import { useMemo } from "react";
import { isKeyFacet, KeyFacet } from "../lib/types";
import { useQueryKeyFacet } from "../lib/hooks/useQueryKeyFacet";
import { Star } from "lucide-react";
import { useKeyFacetValuePopularity } from "../hooks/popularityHooks";

import { Button } from "../components/ui/button";

const ignoredFacets = [2, 6, 10, 11, 12, 13, 3, 4, 31157, 33245, 31321, 36186];

const toSorted = (values: Record<string, number>) =>
  Object.entries(values)
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, count }));

export const KeyFacetSelector = ({ name, id, result }: KeyFacet) => {
  const { values } = result;
  const {
    filter: filterValue,
    updateValue,
    removeValue,
  } = useQueryKeyFacet(id);

  const allSorted = useMemo(() => toSorted(values), [values, filterValue]);

  //const { data: popularValues } = useKeyFacetValuePopularity(id);

  return (
    <div>
      <span>{name}</span>
      <fieldset className="flex gap-2 flex-wrap">
        {allSorted.map(({ value, count }) => {
          return (
            <Button
              variant={filterValue.has(value) ? "danger" : "outline"}
              onClick={() =>
                filterValue.has(value)
                  ? removeValue(value)
                  : updateValue([value])
              }
              key={value}
            >
              {value}{" "}
              {count > 1 && !filterValue.has(value) && (
                <span className="text-sm text-gray-400">({count})</span>
              )}
            </Button>
          );
        })}
      </fieldset>
    </div>
  );
};

const FacetSelector = () => {
  const { facets } = useQuery();
  const toShow = useMemo<KeyFacet[]>(() => {
    return facets
      .filter(isKeyFacet)
      .filter((facet) => !ignoredFacets.includes(facet.id));
  }, [facets]);
  return (
    <div className="flex flex-col gap-3">
      {toShow.map((facet) => (
        <KeyFacetSelector key={facet.id} {...facet} />
      ))}
    </div>
  );
};

export const ProductConfigurator = () => {
  return (
    <div className="container mx-auto my-10">
      <QueryProvider
        ignoreFacets={ignoredFacets}
        initialQuery={{
          string: [
            { id: 30879, value: ["Apple Watch S10"] },
            { id: 10, value: ["Mobiler, Tablets & Smartklockor"] },
          ],
        }}
      >
        <h1 className="text-2xl font-bold mb-4">Product Configurator</h1>
        <p className="text-lg mb-4">
          This is a simple product configurator page.
        </p>
        <div className="mb-6">
          <FacetSelector />
        </div>
        <SearchResultList />
      </QueryProvider>
    </div>
  );
};
