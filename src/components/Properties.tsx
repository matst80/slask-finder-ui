import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "../hooks/appState";
import { useFacetMap } from "../hooks/searchHooks";
import { useQuery } from "../lib/hooks/useQuery";
import { ItemDetail, ItemsQuery } from "../lib/types";
import { isDefined, byPriority, cm } from "../utils";
import { PlusIcon } from "lucide-react";
import { QueryProvider } from "../lib/hooks/QueryProvider";
import { TotalResultText } from "./ResultHeader";
import { QueryUpdater } from "./QueryMerger";
import { ButtonLink } from "./ui/button";
import { useTranslations } from "../lib/hooks/useTranslations";

const ignoreFaceIds = [3, 4, 5, 10, 11, 12, 13];

type SelectedFacet = {
  id: number;
  value: string[];
};

const isValidKeyFilter = (
  value: string[] | string | number | null | undefined
) => {
  if (value == null) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === "string") {
    return value.length > 0;
  }

  return false;
};

export const Properties = ({ values }: Pick<ItemDetail, "values">) => {
  const { setQuery } = useQuery();
  const [selected, setSelected] = useState<SelectedFacet[]>([]);
  const { data } = useFacetMap();
  const [isAdmin] = useAdmin();
  const t = useTranslations();
  const customQuery = useMemo<ItemsQuery | null>(() => {
    if (selected.length === 0) {
      return null;
    }
    const query: ItemsQuery = {
      page: 0,
      string: selected.map((s) => ({
        id: s.id,
        value: s.value,
      })),
    };
    return query;
  }, [selected]);
  const fields = useMemo(() => {
    return Object.entries(values)
      .map(([id, value]) => {
        const facet = data?.[id];
        if (!facet || ignoreFaceIds.includes(facet.id)) {
          return null;
        }
        if (!isAdmin && facet.hide) {
          return null;
        }
        return {
          ...facet,
          value,
        };
      })
      .filter(isDefined)
      .sort(byPriority);
  }, [values, data, isAdmin]);
  return (
    <div className="md:bg-white md:rounded-lg md:shadow-xs md:border border-gray-100 md:p-4 relative">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        {t("product.properties")}
        <span className="ml-2 text-gray-500 text-lg">({fields.length})</span>
      </h3>
      {customQuery != null && (
        <div className="bg-slate-100 absolute z-10 top-1 right-1 rounded-md p-3 flex flex-col gap-2 items-center">
          <QueryProvider initialQuery={customQuery}>
            <QueryUpdater query={customQuery} />
            <TotalResultText className="text-sm" />
          </QueryProvider>
          <ButtonLink onClick={() => setQuery(customQuery)} to="/">
            {t("common.search")}
          </ButtonLink>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
        {fields.map((field) => {
          const isSelected = selected.some((s) => s.id === field.id);
          return (
            <div
              key={`prop-${field.id}-${field.valueType}`}
              className="py-2 md:p-3 md:rounded-lg md:hover:bg-gray-50 transition-colors relative"
            >
              {isValidKeyFilter(field.value) && (
                <button
                  className="absolute top-2 right-2 p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                  onClick={() => {
                    if (field.value != null) {
                      setSelected((prev) => {
                        const newSelected = prev.filter(
                          (s) => s.id !== field.id
                        );
                        if (isSelected) {
                          return newSelected;
                        } else {
                          return [
                            ...newSelected,
                            {
                              id: field.id,
                              value: Array.isArray(field.value)
                                ? field.value
                                : [String(field.value)],
                            },
                          ];
                        }
                      });
                    }
                  }}
                >
                  <PlusIcon
                    className={cm(
                      " hover:text-gray-700 cursor-pointer size-5",
                      isSelected ? "text-blue-500" : "text-gray-500"
                    )}
                  />
                </button>
              )}
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className="text-lg font-semibold text-gray-900"
                  onClick={() => {
                    navigator.clipboard.writeText(String(field.id));
                  }}
                >
                  {field.name}
                  {field.isKey && (
                    <span className="text-xs text-gray-500">*</span>
                  )}
                </h4>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-gray-700">
                  {Array.isArray(field.value)
                    ? field.value.join(", ")
                    : String(field.value)}
                </p>

                {field.linkedId != null &&
                  isAdmin &&
                  field.linkedId > 0 &&
                  field.value != null && (
                    <Link
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
                      to="/"
                      onClick={() => {
                        if (field.linkedId != null && field.value != null) {
                          setQuery({
                            page: 0,
                            string: [
                              {
                                id: field.linkedId,
                                value: Array.isArray(field.value)
                                  ? field.value
                                  : [String(field.value)],
                              },
                            ],
                          });
                        }
                      }}
                    >
                      {t("common.show_compatible")}
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {field.linkedId}
                      </span>
                    </Link>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
