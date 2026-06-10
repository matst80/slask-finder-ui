/** biome-ignore-all lint/suspicious/noExplicitAny: why */
import { useCallback, useContext } from 'react'
import { translationContext } from './translationContext'
import {
  BaseTranslationType,
  extractFromObject,
  PathInto,
  replaceMustacheKeys,
} from './translations'

export const useTranslations = <T extends BaseTranslationType = any>() => {
  const translations = useContext(translationContext)
  if (translations === null) {
    throw new Error('useTranslations must be used within a TranslationProvider')
  }
  return useCallback(
    (
      key: PathInto<T> & string,
      replacementValues?: Record<string, unknown>,
      defaultValue?: string,
    ): string => {
      if (typeof key !== 'string') {
        return defaultValue ?? key
      }
      const value = extractFromObject(translations, key.split('.'))
      return value
        ? replaceMustacheKeys(value, replacementValues)
        : defaultValue || key
    },
    [translations],
  )
}
