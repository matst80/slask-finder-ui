export type NotificationVariant = "success" | "error" | "info" | "warning"

export interface NotificationType {
  id: string
  title: string
  message?: string
  variant?: NotificationVariant
  duration?: number
  dismissed?: boolean
}
