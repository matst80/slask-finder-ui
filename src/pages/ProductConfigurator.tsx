import { QueryProvider } from "../lib/hooks/QueryProvider";
import { useQuery } from "../lib/hooks/useQuery";
import { useMemo } from "react";
import { isKeyFacet, KeyFacet } from "../lib/types";
import { useQueryKeyFacet } from "../lib/hooks/useQueryKeyFacet";

import { Button } from "../components/ui/button";
import { makeImageUrl } from "../utils";

const ignoredFacets = [
  2, 6, 10, 11, 12, 13, 3, 4, 31157, 33245, 31321, 36186, 31559,
];

const toSorted = (values: Record<string, number>) =>
  Object.entries(values)
    .sort((a, b) => a[0].localeCompare(b[0]))
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
    <div className="border-b border-gray-300 pb-6 last:border-b-0">
      <span className="text-lg mb-4 block">{name}</span>
      <fieldset className="flex gap-2 flex-wrap">
        {allSorted.map(({ value }) => {
          return (
            <Button
              variant={filterValue.has(value) ? "default" : "outline"}
              size="sm"
              onClick={() =>
                filterValue.has(value)
                  ? removeValue(value)
                  : updateValue([value])
              }
              key={value}
            >
              {value}
              {/* {count > 1 && !filterValue.has(value) && (
                <span className="text-sm text-gray-400">({count})</span>
              )} */}
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

const ResultItem = () => {
  const { hits, totalHits } = useQuery();
  const [first] = hits;
  if (!first) {
    return <div className="flex items-center justify-center h-full"></div>;
  }
  const { title, img } = first;

  return (
    <div className="flex items-center justify-center h-full p-6 relative">
      <div className="absolute top-3 right-3 p-2 bg-purple-500 rounded-full aspect-square w-10 h-10 flex items-center justify-center text-white font-bold">
        {totalHits}
      </div>
      <img
        className="max-w-full mix-blend-multiply h-auto object-contain product-image"
        src={makeImageUrl(img)}
        alt={title}
      />
    </div>
  );
};

export const ProductConfigurator = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_auto] gap-2 h-screen">
      <QueryProvider
        ignoreFacets={ignoredFacets}
        initialQuery={{
          string: [
            { id: 30879, value: ["Apple Watch S10"] },
            { id: 10, value: ["Mobiler, Tablets & Smartklockor"] },
          ],
        }}
      >
        <div className="mb-6 p-6 md:mb-0 bg-gray-100 border-b md:border-b-0 md:border-r md:border-gray-300">
          <h1 className="text-2xl font-bold mb-4">Apple Watch S10</h1>

          <FacetSelector />
        </div>
        <ResultItem />
        {/* <SearchResultList /> */}
      </QueryProvider>
    </div>
  );
};
