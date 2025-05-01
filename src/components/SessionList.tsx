import { useTranslations } from "../lib/hooks/useTranslations";
import { Sessions } from "./Sessions";

export const SessionList = () => {
  const t = useTranslations();
  return (
    <div className="p-4 md:p-6">
      <h3 className="font-bold">{t("tracking.menu.sessions")}</h3>
      <div className="flex-1 overflow-y-auto">
        <Sessions />
      </div>
    </div>
  );
};
