import { PropsWithChildren, useEffect, useState } from 'react'
import { toQuery } from '../../hooks/searchHooks'
import * as api from '../datalayer/api'
import { Facet, isKeyFacet, KeyFacet } from '../types'
import { FacetContext } from './facetContext'
import { useQuery } from './useQuery'

const facetCache = new Map<string, Facet[]>()

const splitCategoryFacets = (facets: Facet[]): [KeyFacet[], Facet[]] => {
  return facets.reduce(
    ([c, all], facet) => {
      if (
        facet.categoryLevel != null &&
        facet.categoryLevel > 0 &&
        isKeyFacet(facet)
      ) {
        return [[...c, facet], all]
      }
      return [c, [...all, facet]]
    },
    [[] as KeyFacet[], [] as Facet[]],
  )
}

type FacetProviderProps = {
  ignoreFacets?: number[]
  delay?: number
}

export const FacetProvider = ({
  ignoreFacets,
  children,
  delay = 30,
}: PropsWithChildren<FacetProviderProps>) => {
  const { query } = useQuery()
  const [isLoadingFacets, setIsLoadingFacets] = useState(false)
  const [facetsKey, setFacetsKey] = useState<string | null>(null)
  const [facets, setFacets] = useState<Facet[]>([])
  const [categoryFacets, setCategoryFacets] = useState<KeyFacet[]>([])

  useEffect(() => {
    const { query: q, range, stock, string } = query
    const key = new URLSearchParams(
      toQuery({ query: q, range, stock, string }, ignoreFacets),
    ).toString()

    setFacetsKey(key)
  }, [query, delay])
  useEffect(() => {
    if (facetsKey == null) {
      return
    }
    if (facetCache.has(facetsKey)) {
      const cached = facetCache.get(facetsKey) ?? []

      const [cat, other] = splitCategoryFacets(cached)
      setFacets(other)
      setCategoryFacets(cat)
    }

    setIsLoadingFacets(true)
    api
      .facets(facetsKey)
      .then((data) => {
        facetCache.set(facetsKey, data)
        const [cat, other] = splitCategoryFacets(data)
        setFacets(other)
        setCategoryFacets(cat)
      })
      .finally(() => {
        setIsLoadingFacets(false)
      })
  }, [facetsKey, ignoreFacets])

  return (
    <FacetContext.Provider
      value={{
        facets,
        categoryFacets,
        isLoadingFacets,
      }}
    >
      {children}
    </FacetContext.Provider>
  )
}
