"use client";
import { Notification } from "./notification";
import type { NotificationType } from "./types";

interface NotificationsContainerProps {
  notifications: NotificationType[];
  dismissNotification: (id: string) => void;
}

export const NotificationsContainer = ({
  notifications,
  dismissNotification,
}: NotificationsContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-[80vw] md:max-w-[500px]">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onDismiss={() => dismissNotification(notification.id)}
        />
      ))}
    </div>
  );
};
