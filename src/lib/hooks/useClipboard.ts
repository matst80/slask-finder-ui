import { useCallback } from "react";
import { useNotifications } from "../../components/ui-notifications/useNotifications";
import { useTranslations } from "./useTranslations";

export const useClipboard = () => {
  const t = useTranslations();
  const { showNotification } = useNotifications();
  return useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      showNotification({
        variant: "success",
        message: t("common.copied", { content }),
        title: t("common.copied_title"),
      });
    });
  }, []);
};
