import { useState } from "react";
import { Item } from "../lib/types";
import { naturalSearch } from "../lib/datalayer/api";
import { Input } from "../components/ui/input";
import { ImpressionProvider } from "../lib/hooks/ImpressionProvider";
import { ResultItemInner } from "../components/ResultItem";
import { Button } from "../components/ui/button";
import { trackDataSet } from "../lib/datalayer/beacons";

const isComplete = (dataset: {
  positive?: string;
  negative?: string;
}): dataset is { positive: string; negative: string } => {
  return dataset.positive !== undefined && dataset.negative !== undefined;
};

export const NaturalLanguageSearch = () => {
  const [term, setTerm] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [dataset, setDataset] = useState<{
    positive?: string;
    negative?: string;
  }>({ positive: undefined, negative: undefined });

  const doSearch = async () => {
    naturalSearch(term)
      .then(setItems)
      .catch((error) => {
        console.error("Search error:", error);
      });
  };
  return (
    <div className="flex flex-col container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Embeddings training</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          doSearch();
          setDataset({ positive: undefined, negative: undefined });
        }}
        className="flex gap-2"
      >
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Enter your search query"
          className="flex-1"
        />
        <Button type="submit" variant="default" size="sm">
          Search
        </Button>
        <Button
          disabled={!isComplete(dataset)}
          onClick={() => {
            if (isComplete(dataset)) {
              trackDataSet({
                query: term,
                positive: dataset.positive,
                negative: dataset.negative,
              });
              setDataset({ positive: undefined, negative: undefined });
            }
          }}
        >
          Add
        </Button>
      </form>
      <div className="mt-6">
        {items.length > 0 ? (
          <ImpressionProvider>
            <div
              id="results"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 md:gap-2 -mx-4 md:-mx-0 scroll-snap-y"
            >
              {items?.map((item, idx) => (
                <span
                  key={item.id}
                  className="group bg-white md:shadow-xs hover:shadow-md transition-all hover:z-10 duration-300 animating-element relative snap-start flex-1 min-w-64 flex flex-col result-item hover:bg-linear-to-br hover:from-white hover:to-gray-50 border-b border-gray-200 md:border-b-0"
                >
                  <ResultItemInner key={item.id} {...item}>
                    <div className="button-group absolute bottom-2 right-2">
                      <button
                        onClick={() =>
                          setDataset((p) => ({
                            ...p,
                            positive:
                              p.positive === item.title
                                ? undefined
                                : item.title!,
                          }))
                        }
                      >
                        +
                      </button>
                      <button
                        onClick={() =>
                          setDataset((p) => ({
                            ...p,
                            negative:
                              p.negative === item.title
                                ? undefined
                                : item.title!,
                          }))
                        }
                      >
                        -
                      </button>
                    </div>
                  </ResultItemInner>
                </span>
              ))}
            </div>
            {/* {first && (
									<div className="-mx-4 md:-mx-0 mb-6">
										<Banner item={first} />
									</div>
								)}
								{last && (
									<div className="-mx-4 md:-mx-0 mt-6">
										<Banner item={last} />
									</div>
								)} */}
          </ImpressionProvider>
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
};
