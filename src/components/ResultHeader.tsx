import { PropsWithChildren } from "react";
import { Sorting } from "./Sorting";
import { useQuery } from "../lib/hooks/useQuery";
import { FilterQuery } from "./FilterQuery";
import { useTranslations } from "../lib/hooks/useTranslations";

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
  const { totalHits, query } = useQuery();

  if (totalHits === 0 && !query.filter) {
    return null;
  }

  return (
    <>
      <header className="flex justify-end pt-4 md:pt-0 md:justify-between gap-2 items-center mb-2">
        <div className="hidden md:flex">
          <TotalResultText />
        </div>
        {children}

        <Sorting />
      </header>
      <FilterQuery show={!!query.filter || (totalHits ?? 0) > 40} />
    </>
  );
};
