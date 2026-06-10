import { createContext } from 'react'
import type { BaseTranslationType } from './translations'

export const translationContext = createContext<BaseTranslationType | null>(
  null,
)
