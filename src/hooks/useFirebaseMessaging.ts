import { useState, useEffect } from "react";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import firebaseApp from "../firebase";
import { useNotifications } from "../components/ui-notifications/useNotifications";

// You need to generate VAPID keys in your Firebase project settings
const VAPID_KEY =
  "BKYS1HI1_Elr5SglbyB8n0VTRHNVxDvct5kw1aaTYrw_jtJI7l3pw0EjmADJNA6s_5pWkJXYMcQdMIPOBHnTsf8";

export const useFirebaseMessaging = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotifications();

  useEffect(() => {
    const messaging = getMessaging(firebaseApp);

    // Handle foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received in foreground.", payload);
      if (payload.notification) {
        showNotification({
          title: payload.notification.title ?? "New Notification",
          message: payload.notification.body ?? "",
        });
      }
    });

    // Check for existing token
    const checkToken = async () => {
      if (Notification.permission !== "granted") {
        return;
      }
      try {
        const messaging = getMessaging(firebaseApp);
        const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (currentToken) {
          setToken(currentToken);
          setIsSubscribed(true);
          // You would typically send this token to your server
          console.log("FCM Token:", currentToken);
        }
      } catch (err) {
        console.error("An error occurred while retrieving token. ", err);
        setError("An error occurred while retrieving token.");
      }
    };

    checkToken();
    return () => {
      unsubscribe();
    };
  }, [showNotification]);

  const subscribe = async () => {
    setError(null);
    const messaging = getMessaging(firebaseApp);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Permission for notifications was denied.");
        return;
      }

      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (currentToken) {
        setToken(currentToken);
        setIsSubscribed(true);
        // Send this token to your server
        console.log("FCM Token:", currentToken);
      } else {
        setError(
          "No registration token available. Request permission to generate one."
        );
      }
    } catch (err) {
      console.error("An error occurred while retrieving token. ", err);
      setError("An error occurred while retrieving token.");
    }
  };

  return { isSubscribed, subscribe, error, token };
};
