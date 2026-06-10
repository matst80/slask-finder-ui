import { createContext, useContext } from 'react'

export type SdkNotification = {
  title: string
  message: string
  variant: 'success' | 'warning' | 'info' | 'error'
}

export const SdkNotificationContext = createContext<
  ((n: SdkNotification) => void) | null
>(null)

export const useSdkNotification = () => {
  const notify = useContext(SdkNotificationContext)
  return notify || ((n: SdkNotification) => console.log('SDK Notification:', n))
}
