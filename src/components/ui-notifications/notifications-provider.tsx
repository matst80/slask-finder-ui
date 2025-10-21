'use client'

import type React from 'react'
import { useCallback, useState } from 'react'
import { NotificationContext } from './NotificationContext'
import { NotificationsContainer } from './notifications-container'
import type { NotificationType } from './types'

export type NotificationContextType = {
  showNotification: (notification: Omit<NotificationType, 'id'>) => void
  dismissNotification: (id: string) => void
}

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([])

  const showNotification = useCallback(
    (notification: Omit<NotificationType, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      setNotifications((prev) => [...prev, { ...notification, id }])

      if (notification.duration !== Number.POSITIVE_INFINITY) {
        setTimeout(() => {
          dismissNotification(id)
        }, notification.duration || 5000)
      }
    },
    [],
  )

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, dismissed: true }
          : notification,
      ),
    )

    // Remove from state after animation completes
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id),
      )
    }, 500)
  }, [])

  return (
    <NotificationContext.Provider
      value={{ showNotification, dismissNotification }}
    >
      {children}
      <NotificationsContainer
        notifications={notifications}
        dismissNotification={dismissNotification}
      />
    </NotificationContext.Provider>
  )
}
