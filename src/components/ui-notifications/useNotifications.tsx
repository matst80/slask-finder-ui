"use client";
import { useContext } from "react";
import { NotificationContext } from "./NotificationContext";

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
};
