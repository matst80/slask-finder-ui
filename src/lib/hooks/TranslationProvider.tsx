import { PropsWithChildren } from 'react'
import { Translations } from '../../translations/translations'
import { translationContext } from './translationContext'

export const TranslationProvider = ({
  language,
  children,
}: PropsWithChildren<{ language: Translations }>) => {
  return (
    <translationContext.Provider value={language}>
      {children}
    </translationContext.Provider>
  )
}
