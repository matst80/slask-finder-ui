import {
  ImpressionProvider,
  ItemsQuery,
  useQuery,
  useYourPopularItems,
} from '@matst80/slask-finder-sdk'
import { useEffect, useState } from 'react'
import { InfiniteHitList } from './InfiniteHitList'
import { PlaceholderItem, ResultItem } from './ResultItem'

export const useDelayedLoading = (isLoading: boolean, delay = 150) => {
  const [delayed, setDelayed] = useState(false)
  useEffect(() => {
    if (!isLoading) {
      setDelayed(false)
      return
    }
    const timer = setTimeout(() => setDelayed(true), delay)
    return () => clearTimeout(timer)
  }, [isLoading, delay])
  return delayed
}

const NoResults = () => {
  const { data } = useYourPopularItems()
  // const [first, last] = useMemo(() => {
  //   return data?.slice(0, 2) ?? [];
  // }, [data]);

  return (
    <ImpressionProvider>
      <div
        id="results"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 md:gap-2 -mx-4 md:-mx-0 scroll-snap-y"
      >
        {data?.map((item, idx) => (
          <ResultItem key={item.id} item={item} position={idx} />
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
  )
}

const useIsEmptyQuery = (query: ItemsQuery) => {
  const { string, range, filter, query: term } = query
  const isEmpty =
    (string?.length ?? 0) === 0 &&
    (range?.length ?? 0) === 0 &&
    (term?.length ?? 0) === 0 &&
    (filter?.length ?? 0) === 0

  return isEmpty
}

export const SearchResultList = () => {
  const { isLoading, hits, query } = useQuery()
  const isEmpty = useIsEmptyQuery(query)
  const delayedLoading = useDelayedLoading(isLoading, 150)
  if (delayedLoading && !isEmpty) {
    return (
      <div
        id="results"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 md:gap-2 -mx-4 md:-mx-0"
      >
        {Array.from({ length: query.pageSize ?? 20 }).map((_, idx) => (
          <PlaceholderItem key={`p-${idx}`} />
        ))}
      </div>
    )
  }

  if (!hits.length && isEmpty) {
    return <NoResults />
  }

  return (
    <ImpressionProvider>
      <div
        id="results"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 md:gap-2 -mx-4 md:-mx-0 scroll-snap-y"
      >
        <InfiniteHitList>
          {({ item, position }) => (
            <ResultItem key={item.id} item={item} position={position} />
          )}
        </InfiniteHitList>
      </div>
    </ImpressionProvider>
  )
}
