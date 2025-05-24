import { ItemDetail } from "../../lib/types";
import { useFacetMap, queryToHash } from "../../hooks/searchHooks";
import { useTranslations } from "../../lib/hooks/useTranslations";
import { useMemo } from "react";
import { isDefined } from "../../utils";
import { ButtonLink } from "../ui/button";

export const CompatibleButton = ({ values }: Pick<ItemDetail, "values">) => {
  const { data } = useFacetMap();
  const t = useTranslations();
  const stringFilters = useMemo(() => {
    const filter = Object.entries(values)
      .map(([id]) => {
        const facet = data?.[id];
        if (!facet || facet.linkedId == null) {
          return null;
        }
        if (facet.linkedId == 31158) {
          return null;
        }
        const value = values[id];
        if (value == null) {
          return null;
        }
        return {
          id: facet.linkedId!,
          value: Array.isArray(value) ? value : [String(value)],
        };
      })
      .filter(isDefined);

    return filter;
  }, [values, data]);

  if (stringFilters.length === 0) return null;
  return (
    <ButtonLink
      href={`/#${queryToHash({
        page: 0,
        string: stringFilters,
        range: [],
      })}`}
      size="sm"
    >
      {t("common.show_compatible", {
        ids: stringFilters.map((f) => f.id).join(", "),
      })}
    </ButtonLink>
  );
};
