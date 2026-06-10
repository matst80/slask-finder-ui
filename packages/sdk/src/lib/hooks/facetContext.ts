import { createContext } from 'react'
import { Facet, KeyFacet } from '../types'

type FacetContextType = {
  facets: Facet[]
  categoryFacets: KeyFacet[]
  isLoadingFacets: boolean
}

export const FacetContext = createContext<FacetContextType | null>(null)
