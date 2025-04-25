"use client";
import { createContext } from "react";
import { NotificationContextType } from "./notifications-provider";

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);
