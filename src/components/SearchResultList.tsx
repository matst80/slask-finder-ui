import { PlaceholderItem, ResultItem } from "./ResultItem";
import { useQuery } from "../lib/hooks/useQuery";
import { ImpressionProvider } from "../lib/hooks/ImpressionProvider";
import { InfiniteHitList } from "./InfiniteHitList";

const NoResults = () => {
  return <div>No results</div>;
};

export const SearchResultList = () => {
  const {
    isLoading,
    hits,
    query: { pageSize },
  } = useQuery();

  if (isLoading && hits.length < 1) {
    return (
      <div
        id="results"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 md:gap-2 -mx-4 md:-mx-0"
      >
        {new Array(pageSize)?.map((_, idx) => (
          <PlaceholderItem key={`p-${idx}`} />
        ))}
      </div>
    );
  }

  if (!hits.length && (hits == null || hits.length < 1)) {
    return <NoResults />;
  }

  return (
    <ImpressionProvider>
      <div
        id="results"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 md:gap-2 -mx-4 md:-mx-0 scroll-snap-y"
      >
        <InfiniteHitList>
          {(item) => <ResultItem key={item.id} {...item} />}
        </InfiniteHitList>
      </div>
    </ImpressionProvider>
  );
};
