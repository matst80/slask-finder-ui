import fuzzysort from 'fuzzysort'
import { useState, useEffect, useMemo, PropsWithChildren } from 'react'
import { useFacetMap } from '../../hooks/searchHooks'

import {
  getPopularQueries,
  autoSuggestResponse,
  handleSuggestResponse,
  SuggestionResponse,
  getContentResults,
} from '../datalayer/api'
import { trackSuggest } from '../datalayer/beacons'
import { ContentRecord, ItemsQuery } from '../types'
import {
  convertPopularQueries,
  FlatFacetValue,
  SuggestQuery,
} from './suggestionUtils'
import {
  SuggestionConfig,
  SuggestionContext,
  SuggestResultItem,
} from './suggestionContext'
import { useThrottle } from './useThrottle'

export const MIN_FUZZY_SCORE = 0.85

type Options = {
  config: SuggestionConfig
}

export const SuggestionProvider = ({
  children,
  config,
}: PropsWithChildren<Options>) => {
  const { data: facetData } = useFacetMap()
  const [items, setItems] = useState<SuggestResultItem[]>([])
  const [contentResults, setContentResults] = useState<
    ContentRecord[] | undefined
  >(undefined)
  const [value, setValue] = useState<string | null>(null)
  const searchValue = useThrottle(value, 70)
  const [popularQueries, setPopularQueries] = useState<SuggestQuery[]>([])
  const includeContent = useMemo(
    () => config.some((d) => d.type === 'content' && d.maxAmount > 0),
    [config],
  )
  const [data, setData] = useState<SuggestionResponse>({
    facets: [],
    items: [],
    suggestions: [],
  })
  const [smartQuery, setSmartQuery] = useState<ItemsQuery | null>(null)
  const [possibleTriggers, setPossibleTriggers] = useState<
    | {
        word: string
        result: Fuzzysort.KeysResults<FlatFacetValue>
      }[]
    | null
  >(null)

  const { suggestions, facets } = data

  useEffect(() => {
    if (facetData == null) {
      return
    }
    getPopularQueries(value ?? '')
      .then(convertPopularQueries(facetData))
      .then(setPopularQueries)
  }, [value, facetData])

  const parts = useMemo(() => {
    if (value == null) {
      return new Set<string>()
    }
    const words = value.toLocaleLowerCase().split(' ')
    const lastWord = words.pop()
    if (lastWord == null) {
      return new Set<string>()
    }
    return new Set(words.concat(lastWord))
  }, [value])

  useEffect(() => {
    if (facets == null || facets.length === 0) {
      return
    }
    const wordResults = Array.from(parts).map((word) => {
      const result = fuzzysort.go(
        word,
        facets.flatMap(({ values, ...rest }) =>
          values.map(
            ({ value, hits }): FlatFacetValue => ({ ...rest, value, hits }),
          ),
        ) ?? [],
        {
          keys: ['value'],
          limit: 10,
          threshold: -100,
        },
      )

      return { word, result }
    })

    const words = new Set(parts)

    const newQuery: ItemsQuery = {
      string: [],
      range: [],
    }

    wordResults.forEach(({ word, result }) => {
      const [best] = result
      if (best != null && best.score > MIN_FUZZY_SCORE) {
        words.delete(word)
        newQuery.string = [
          ...(newQuery.string?.filter((d) => d.id !== best.obj.id) ?? []),
          {
            id: best.obj.id,
            value: [
              ...(newQuery.string?.find((d) => d.id === best.obj.id)?.value ??
                []),
              best.obj.value,
            ],
          },
        ]
      }
    })

    newQuery.query = words.size > 0 ? Array.from(words).join(' ') : undefined
    const validTriggers = wordResults.filter(({ result }) => result.length > 0)
    if (validTriggers.length === 0) {
      setSmartQuery(null)
      setPossibleTriggers(null)
      return
    } else {
      setSmartQuery(newQuery)
      setPossibleTriggers(validTriggers)
    }
    //return [wordResults, newQuery];
  }, [parts, facets])

  useEffect(() => {
    if (searchValue == null || searchValue.length < 2 || !includeContent) {
      return
    }
    getContentResults(searchValue).then((d) =>
      setContentResults(d.splice(0, 10)),
    )
  }, [searchValue, includeContent])

  useEffect(() => {
    if (searchValue == null) {
      return
    }
    const { cancel, promise } = autoSuggestResponse(
      searchValue === '*' ? '' : searchValue,
    )

    promise.then(handleSuggestResponse).then((state) => {
      setData((prev) => {
        const hasFacets = state.facets.length > 0
        const canMerge =
          !hasFacets && searchValue.length > 0 && prev.items.length > 0

        return {
          facets: canMerge ? prev.facets : state.facets,
          items: state.items,
          suggestions: state.suggestions,
        }
      })
      trackSuggest({
        results: state.items.length,
        suggestions: state.suggestions.length,
        value: searchValue,
      })
    })
    return cancel
  }, [searchValue])

  // const hasSuggestions = useMemo(
  //   () =>
  //     items.length > 0 ||
  //     facets.length > 0 ||
  //     suggestions.length > 0 ||
  //     (contentResults != null && contentResults.length > 0) ||
  //     (popularQueries != null && Object.keys(popularQueries).length > 0),
  //   [items, facets, suggestions, popularQueries, contentResults]
  // );

  useEffect(() => {
    const { items, facets } = data
    const result: SuggestResultItem[] = []
    for (const typeConfig of config) {
      const { type, maxAmount } = typeConfig
      switch (type) {
        case 'product':
          if (items.length > 0) {
            const products = items.slice(0, maxAmount).map(
              (item) =>
                ({
                  ...item,
                  type: 'product',
                }) satisfies SuggestResultItem,
            )
            result.push(...products)
          }
          break
        case 'query':
          if (popularQueries.length > 0) {
            const queries = popularQueries.slice(0, maxAmount).map(
              (item) =>
                ({
                  ...item,
                  type: 'query',
                }) satisfies SuggestResultItem,
            )
            result.push(...queries)
          }
          break
        case 'refinement':
          if (facets.length > 0) {
            const refinements = facets.slice(0, maxAmount).flatMap((item) => {
              const { flat, maxHits } = typeConfig.facetConfig[item.id] ?? {
                flat: false,
                maxHits: 2,
              }
              if (flat) {
                const result = fuzzysort.go(value ?? '', item.values, {
                  limit: maxHits,
                  keys: ['value'],
                  threshold: 0.6,
                })

                if (result.length > 0) {
                  const values = result.map((d) => d.obj)
                  return {
                    facetId: item.id,
                    facetName: item.name,
                    values,
                    query: value ?? undefined,
                    flat: true,
                    type: 'refinement',
                  } satisfies SuggestResultItem
                }
                return []
              }
              return {
                query: value ?? undefined,
                facetId: item.id,
                facetName: item.name,
                values: item.values,
                flat: false,
                type: 'refinement',
              } satisfies SuggestResultItem
            })
            result.push(...refinements)
          }
          break
        case 'content':
          if (contentResults != null && contentResults.length > 0) {
            const contents = contentResults.slice(0, maxAmount).map(
              (item) =>
                ({
                  ...item,
                  type: 'content',
                }) satisfies SuggestResultItem,
            )
            result.push(...contents)
          }
          break
      }
      setItems(result)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, config, facets, suggestions, popularQueries, contentResults])

  return (
    <SuggestionContext.Provider
      value={{
        suggestions,
        items,
        setValue,
        value,
        possibleTriggers,
        smartQuery,
      }}
    >
      {children}
    </SuggestionContext.Provider>
  )
}
