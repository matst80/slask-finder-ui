import { PropsWithChildren, useMemo } from "react";
import { Sorting } from "./Sorting";
import { useQuery } from "../lib/hooks/useQuery";
import { FilterQuery } from "./FilterQuery";
import { facetQueryToHash } from "../hooks/searchHooks";
import { Button } from "./ui/button";
import { ArrowLeftIcon, CopyIcon } from "lucide-react";
import { queryToHash } from "../lib/utils";
import { useTranslations } from "../lib/hooks/useTranslations";
import { useClipboard } from "../lib/hooks/useClipboard";

export const TotalResultText = ({
  className = "md:text-2xl font-bold",
}: {
  className?: string;
}) => {
  const t = useTranslations();
  const { totalHits } = useQuery();
  return (
    <h1 className={className}>
      {t("result.header", { hits: totalHits ?? "~" })}
    </h1>
  );
};

export const ResultHeader = ({ children }: PropsWithChildren) => {
  const { totalHits, queryHistory, query, setQuery } = useQuery();
  const currentKey = useMemo(() => facetQueryToHash(query), [query]);
  const copyToClipboard = useClipboard();
  const t = useTranslations();

  const prevQuery = useMemo(() => {
    const idx = queryHistory.findIndex((d) => d.key === currentKey);
    if (idx === -1) {
      return null;
    }
    return queryHistory[idx - 1] ?? null;
  }, [queryHistory, currentKey]);
  return (
    <>
      <header className="flex justify-end pt-4 md:pt-0 md:justify-between gap-2 items-center mb-2">
        <div className="hidden md:flex">
          <TotalResultText />
        </div>
        {children}
        <div className="relative flex gap-2 items-center justify-end">
          {prevQuery != null && (
            <Button
              size="icon"
              title={t("result.back")}
              variant="ghost"
              onClick={() => setQuery(prevQuery)}
            >
              <ArrowLeftIcon className="size-5 m-1" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            title={t("result.copy")}
            onClick={() =>
              copyToClipboard(`${location.origin}/#${queryToHash(query)}`)
            }
          >
            <CopyIcon className="size-5 m-1" />
          </Button>
          <Sorting />
        </div>
      </header>
      <FilterQuery show={(totalHits ?? 0) > 40} />
    </>
  );
};
