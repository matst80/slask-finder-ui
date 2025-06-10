import { useState } from "react";
import { Item } from "../lib/types";
import { naturalSearch } from "../lib/datalayer/api";
import { Input } from "../components/ui/input";
import { ImpressionProvider } from "../lib/hooks/ImpressionProvider";
import { ResultItem } from "../components/ResultItem";
import { Button } from "../components/ui/button";

export const NaturalLanguageSearch = () => {
  const [term, setTerm] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const doSearch = async () => {
    naturalSearch(term)
      .then(setItems)
      .catch((error) => {
        console.error("Search error:", error);
      });
  };
  return (
    <div className="flex flex-col container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Natural Language Search</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          doSearch();
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
      </form>
      <div className="w-1/2">
        {items.length > 0 ? (
          <ImpressionProvider>
            <div
              id="results"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 md:gap-2 -mx-4 md:-mx-0 scroll-snap-y"
            >
              {items?.map((item, idx) => (
                <ResultItem key={item.id} {...item} position={idx} />
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
