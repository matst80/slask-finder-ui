import { ButtonLink } from "../components/ui/button";
import { Sessions } from "../components/Sessions";
import { useTranslations } from "../lib/hooks/useTranslations";

export const Tracking = () => {
  const t = useTranslations();
  return (
    <div className="grid grid-cols-[25rem_auto] min-h-screen">
      <div className="border-r border-gray-300 py-10 px-5 flex flex-col gap-4 bg-gray-50 sticky top-0">
        <div className="flex flex-col gap-4 pb-6">
          <ButtonLink href="/stats/queries">
            {t("tracking.menu.queries")}
          </ButtonLink>

          <ButtonLink href="/stats/popular">
            {t("tracking.menu.items")}
          </ButtonLink>

          <ButtonLink href="/stats/facets">
            {t("tracking.menu.facets")}
          </ButtonLink>
          <ButtonLink href="/stats/funnels">
            {t("tracking.menu.funnels")}
          </ButtonLink>
        </div>
        <h3 className="font-bold">{t("tracking.menu.sessions")}</h3>
        <div className="flex-1 overflow-y-auto">
          <Sessions />
        </div>
      </div>
    </div>
  );
};
