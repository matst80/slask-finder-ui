"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import type { NotificationType } from "./types";
import { cm } from "../../utils";

interface NotificationProps {
  notification: NotificationType;
  onDismiss: () => void;
}

const baseStyles =
  "relative overflow-hidden rounded-lg p-4 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out";

const notificationVariants = {
  success: "bg-gradient-to-r from-emerald-500/90 to-green-500/90 text-white",
  error: "bg-gradient-to-r from-rose-500/90 to-red-500/90 text-white",
  info: "bg-gradient-to-r from-sky-500/90 to-blue-500/90 text-white",
  warning: "bg-gradient-to-r from-amber-500/90 to-yellow-500/90 text-white",
};

const dismissedStyle = {
  true: "translate-x-[120%] opacity-0",
  false: "translate-x-0 opacity-100",
};

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

export const Notification = ({
  notification,
  onDismiss,
}: NotificationProps) => {
  const [progress, setProgress] = useState(100);
  const {
    title,
    message,
    variant = "info",
    duration = 5000,
    dismissed,
  } = notification;
  const Icon = iconMap[variant];

  useEffect(() => {
    if (duration === Number.POSITIVE_INFINITY || dismissed) return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateProgress = () => {
      const now = Date.now();
      const remaining = endTime - now;
      const newProgress = (remaining / duration) * 100;

      if (newProgress <= 0) {
        setProgress(0);
        return;
      }

      setProgress(newProgress);
      requestAnimationFrame(updateProgress);
    };

    const animationId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationId);
  }, [duration, dismissed]);

  return (
    <div
      className={cm(
        baseStyles,
        dismissed ? dismissedStyle.true : dismissedStyle.false,
        notificationVariants[variant],
        "flex items-start gap-3"
      )}
      onClick={() => {
        globalThis.navigator.clipboard.writeText(message ?? title);
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm">{title}</h3>
        {message && <p className="text-sm opacity-90 mt-1">{message}</p>}
      </div>

      <button
        onClick={onDismiss}
        className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-white/20"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>

      {duration !== Number.POSITIVE_INFINITY && !dismissed && (
        <div className="absolute bottom-0 left-0 h-1 bg-white/30">
          <div
            className="h-full bg-white/70"
            style={{ width: `${progress}%`, transition: "width 100ms linear" }}
          />
        </div>
      )}
    </div>
  );
};
