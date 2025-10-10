import useSWR from 'swr'
import { getEmptyTrackingQueries } from '../../lib/datalayer/api'
import { useTranslations } from '../../lib/hooks/useTranslations'
import { useFacetMap } from '../../hooks/searchHooks'
import { useMemo } from 'react'
import { isDefined } from '../../utils'

export const EmptyQueriesView = () => {
  const { data } = useSWR('/tracking/no-results', getEmptyTrackingQueries)
  const t = useTranslations()
  const { data: facetMap } = useFacetMap()

  const toShow = useMemo(() => {
    if (!data || !facetMap) return []
    return data
      .filter((d) => d.query != null)
      .map((item) => {
        const { range, string } = item
        const parsedRange = range
          ?.map((facet) => {
            return facet ? { ...facet, name: facetMap[facet.id].name } : null
          })
          .filter(isDefined)
        const parsedString = string
          ?.map((facet) => {
            return facet ? { ...facet, name: facetMap[facet.id].name } : null
          })
          .filter(isDefined)
        return {
          ...item,
          range: parsedRange,
          string: parsedString,
        }
      })
  }, [data, facetMap])

  return (
    <div className="p-4 md:p-6">
      <h1 className="font-bold text-2xl mb-6">
        {t('tracking.emptyqueries.title')}
      </h1>
      {/* <JsonView data={data} /> */}
      <div className="grid gap-4">
        {toShow?.map(({ query, range, string }, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-xs p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-800 font-medium">
                  {query ?? '-- No query --'}
                </span>
              </div>

              {range && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Range:</span>{' '}
                  {range.map((facet) => (
                    <span
                      key={facet.id}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium mr-2"
                    >
                      {facet.name}: {facet.min} - {facet.max}
                    </span>
                  ))}
                </div>
              )}

              {string && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Filter:</span>{' '}
                  {string.map((facet) => (
                    <span
                      key={facet.id}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium mr-2"
                    >
                      {facet.name}: {facet.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
