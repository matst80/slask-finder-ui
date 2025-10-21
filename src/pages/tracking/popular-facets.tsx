import { useMemo } from 'react'
import useSWR from 'swr'
import { FacetCard } from '../../components/FacetCard'
import { useFacetMap } from '../../hooks/searchHooks'
import { getTrackingFieldPopularity } from '../../lib/datalayer/api'
import { useTranslations } from '../../lib/hooks/useTranslations'
import { isDefined } from '../../utils'

export const PopularFacetsView = () => {
  const { data } = useSWR('/api/facets', getTrackingFieldPopularity)
  const { data: facets } = useFacetMap()
  const t = useTranslations()
  const popularFacets = useMemo(() => {
    if (!data || !facets) return []
    return Object.entries(data)
      .map(([facetId, count]) => {
        const facet = facets?.[parseInt(facetId)]
        if (!facet) return null
        return {
          ...facet,
          id: parseInt(facetId),
          count,
        }
      })
      .filter(isDefined)
      .sort((a, b) => b.count - a.count)
  }, [data, facets])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {t('tracking.facets.title')}
        </h1>
        <p className="text-gray-600">{t('tracking.facets.description')}</p>
      </div>

      <div className="grid gap-4">
        {popularFacets.map((facet, i) => (
          <FacetCard key={i} facet={facet} />
        ))}
      </div>
    </div>
  )
}
