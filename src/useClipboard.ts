import { useCallback } from 'react'
import { useTranslations } from './translations/useTranslations'

export const useClipboard = (
  showNotification?: (opt: {
    variant: 'success' | 'warning' | 'info'
    message: string
    title: string
  }) => void,
) => {
  const t = useTranslations()
  return useCallback(
    (content: string) => {
      navigator.clipboard.writeText(content).then(() => {
        if (showNotification) {
          showNotification({
            variant: 'success',
            message: t('common.copied', { content }),
            title: t('common.copied_title'),
          })
        }
      })
    },
    [showNotification, t],
  )
}
