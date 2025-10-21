import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLoaderData } from 'react-router-dom'
import { Facets } from '../../components/Facets'
import { InfiniteHitList } from '../../components/InfiniteHitList'
import { ResultHeader } from '../../components/ResultHeader'
import { PlaceholderItem, ResultItemInner } from '../../components/ResultItem'
import { toEcomTrackingEvent } from '../../components/toImpression'
import { FacetProvider } from '../../lib/hooks/FacetProvider'
import { ImpressionProvider } from '../../lib/hooks/ImpressionProvider'
import { QueryProvider } from '../../lib/hooks/QueryProvider'
import { useTracking } from '../../lib/hooks/TrackingContext'
import { useImpression } from '../../lib/hooks/useImpression'
import { useQuery } from '../../lib/hooks/useQuery'
import { useTranslations } from '../../lib/hooks/useTranslations'
import { FilteringQuery, Item, ItemValues } from '../../lib/types'
import { TranslationKey } from '../../translations/translations'
import { cm } from '../../utils'
import { ComponentId, Issue, RuleId } from './builder-types'
import { BuilderFooterBar } from './components/BuilderFooterBar'
import { ComponentResultTable } from './components/ComponentResultTable'
import { IssueList } from './IssueList'
import { NextComponentButton } from './NextComponentButton'
import { useBuilderContext } from './useBuilderContext'
import { useBuilderQuery } from './useBuilderQuery'

const ComponentItem = (
  item: Item & {
    componentId: RuleId
    position: number
    issues: Issue[]
    isSelected: boolean
  },
) => {
  const { position, issues, componentId, isSelected } = item
  const { watch } = useImpression()
  const { track } = useTracking()
  const ecomItem = useMemo(
    () => toEcomTrackingEvent(item, position),
    [item, position],
  )
  const trackItem = () => track({ type: 'click', item: ecomItem })

  const hasError = issues.some((d) => d.type === 'error')
  const isValid = issues.length === 0
  const qs = new URLSearchParams(window.location.search)
  const url = `/builder/product/${componentId}/${item.id}?${qs.toString()}`
  return (
    <Link
      ref={watch(ecomItem)}
      to={url}
      key={item.id}
      viewTransition
      onClick={trackItem}
      className={cm(
        'group bg-white md:shadow-xs text-left hover:shadow-md transition-all duration-300 animating-element relative snap-start flex-1 min-w-64 flex flex-col result-item bg-linear-to-br border-b border-gray-200 md:border-b-0',
        isSelected
          ? 'from-blue-100 hover:from-blue-200'
          : 'hover:from-white to-gray-50 hover:to-gray-10',
      )}
    >
      <div
        className={
          isValid ? 'opacity-100' : hasError ? 'opacity-50' : 'opacity-75'
        }
      >
        <ResultItemInner key={item.id} {...item} transitionUrl={url} />
      </div>
      <IssueList issues={issues} />
    </Link>
  )
}

const ComponentResultList = ({
  componentId,
  validator,
}: {
  componentId: RuleId
  validator?: (values: ItemValues) => Issue[]
}) => {
  const {
    isLoading,
    hits,
    query: { pageSize = 20 },
  } = useQuery()
  const { selectedItems } = useBuilderContext()

  if (isLoading && hits.length < 1) {
    return (
      <div
        id="results"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 md:gap-2 -mx-4 md:-mx-0 scroll-snap-y"
      >
        {new Array(pageSize)?.map((_, idx) => (
          <PlaceholderItem key={`p-${idx}`} />
        ))}
      </div>
    )
  }

  const selectedId = selectedItems.find(
    (i) => i.componentId === componentId,
  )?.id

  if (hits == null || hits.length < 1) {
    return <div>No matching components</div>
  }
  return (
    <ImpressionProvider>
      <div
        id="results"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 md:gap-2 -mx-4 md:-mx-0 scroll-snap-y"
      >
        <InfiniteHitList>
          {(item) => {
            const issues = validator?.(item.values) ?? []
            const isSelected = selectedId === item.id
            return (
              <ComponentItem
                key={item.id}
                {...item}
                componentId={componentId}
                position={item.position}
                issues={issues}
                isSelected={isSelected}
              />
            )
          }}
        </InfiniteHitList>
      </div>
    </ImpressionProvider>
  )
}

const views = ['grid', 'table'] as const
type View = (typeof views)[number]

const BuilderQueryMerger = ({
  query,
  componentId,
}: {
  query: FilteringQuery
  componentId: string | number | null
}) => {
  const { setQuery } = useQuery()
  const keyRef = useRef<string | number | null>(componentId)
  useEffect(() => {
    if (keyRef.current === componentId) {
      return
    }

    keyRef.current = componentId
    setQuery(query)
  }, [query, setQuery, componentId])
  return null
}

export const BuilderComponentFilter = () => {
  const componentId = useLoaderData() as ComponentId | null
  const [viewMode, setViewMode] = useState<View>('grid')
  const t = useTranslations()
  const { component, requiredQuery, selectionFilters } = useBuilderQuery(
    componentId ?? undefined,
  )
  const [facetsToHide, facetsToDisable] = useMemo(() => {
    const { filter } = component ?? {}
    return [
      Array.from(
        new Set([
          10,
          11,
          12,
          13,
          ...(filter?.string ?? []).map((d) => d.id),
          ...(filter?.range ?? []).map((d) => d.id),
        ]),
      ),
      selectionFilters?.map((d) => d.id) ?? [],
    ]
  }, [component, selectionFilters])

  if (!requiredQuery || !componentId) {
    return <div>Loading</div>
  }
  return (
    <QueryProvider initialQuery={requiredQuery} attachToHash={true}>
      <BuilderQueryMerger query={requiredQuery} componentId={componentId} />
      <div className="mb-24 md:mt-10 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[288px_auto]">
          <div className="border-b-1 py-1 px-4 md:pr-0 md:py-0 border-gray-300 md:border-none bg-gray-50 md:bg-white">
            <FacetProvider ignoreFacets={facetsToHide}>
              <Facets
                facetsToHide={facetsToHide}
                hideFacetsWithSingleValue={true}
                hideCategories
                facetsToDisable={facetsToDisable}
              />
            </FacetProvider>
          </div>
          <main className="px-4 md:px-10 container">
            <ResultHeader>
              <div className="flex space-x-2">
                {views.map((view) => (
                  <button
                    className={`px-2 md:px-3 py-1 rounded-md ${
                      viewMode === view
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                    onClick={() => setViewMode(view)}
                  >
                    {t(`common.view.${view}` as TranslationKey)}
                  </button>
                ))}
              </div>
            </ResultHeader>

            {viewMode === 'grid' ? (
              <ComponentResultList
                componentId={componentId}
                validator={component?.validator}
              />
            ) : (
              <ComponentResultTable
                componentId={componentId}
                importantFacets={component?.importantFacets ?? []}
                validator={component?.validator}
              />
            )}

            {/* <Paging /> */}
          </main>
        </div>
      </div>
      <BuilderFooterBar>
        <NextComponentButton componentId={componentId} />
      </BuilderFooterBar>
    </QueryProvider>
  )
}
