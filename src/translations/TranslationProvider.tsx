import { PropsWithChildren } from 'react'
import { translationContext } from './translationContext'
import { BaseTranslationType } from './translations'

export const TranslationProvider = <T extends BaseTranslationType>({
  language,
  children,
}: PropsWithChildren<{ language: T }>) => {
  return (
    <translationContext.Provider value={language}>
      {children}
    </translationContext.Provider>
  )
}
