import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "../hooks/appState";
import { useFacetGroups, useFacetMap } from "../hooks/searchHooks";
import { useQuery } from "../lib/hooks/useQuery";
import {
  FacetGroup,
  FacetListItem,
  ItemDetail,
  ItemsQuery,
  RelationGroup,
  RelationMatch,
} from "../lib/types";
import { isDefined, byPriority, cm } from "../utils";
import {
  InfoIcon,
  ListFilterPlus,
  PlugZapIcon,
  PlusIcon,
  Search,
} from "lucide-react";
import { QueryProvider } from "../lib/hooks/QueryProvider";
import { TotalResultText } from "./ResultHeader";
import { QueryUpdater } from "./QueryMerger";
import { useTranslations } from "../lib/hooks/useTranslations";
import { useClipboard } from "../lib/hooks/useClipboard";
import { Tooltip } from "./Tooltip";
import { useGroupDesigner } from "../lib/hooks/GroupDesignerProvider";

const ignoreFaceIds = [
  3, 4, 5, 6, 10, 11, 12, 13, 20, 1, 30, 31, 32, 33, 35, 36, 23, 9, 24,
];

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

type Facet = FacetListItem & {
  value: string[] | string | number;
};

type GroupedFacets = Record<string, Facet[]>;

const byGroup =
  (groups?: FacetGroup[]) =>
  (acc: GroupedFacets, item: Facet): GroupedFacets => {
    const group: string =
      groups?.find((g) => g.id === item.groupId)?.name ??
      "Funktioner och egenskaper";
    const addKey: GroupedFacets = item.isKey
      ? {
          Nyckelspecifikationer: [...(acc.Nyckelspecifikationer ?? []), item],
        }
      : {};
    if (!acc[group]) {
      return {
        ...acc,
        ...addKey,
        [group]: [item],
      };
    }
    return {
      ...acc,
      ...addKey,
      [group]: [...acc[group], item],
    };
  };

export const GroupedProperties = ({ values }: Pick<ItemDetail, "values">) => {
  const { setQuery } = useQuery();
  const [selected, setSelected] = useState<SelectedFacet[]>([]);
  const { setGroup } = useGroupDesigner();
  const { data: groups } = useFacetGroups();
  const { data } = useFacetMap();
  const [isAdmin] = useAdmin();
  const copyToClipboard = useClipboard();
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
        if (!facet || value == null || ignoreFaceIds.includes(facet.id)) {
          return null;
        }

        return {
          ...facet,
          value,
        } satisfies Facet;
      })
      .filter(isDefined)
      .sort(byPriority)
      .reduce<GroupedFacets>(byGroup(groups), {});
  }, [values, data, groups, isAdmin]);
  const setInGroup =
    (
      group: keyof Pick<RelationGroup, "additionalQueries" | "requiredForItem">
    ) =>
    () => {
      setGroup((prev) => {
        const newGroup = {
          ...prev,
          [group]: selected.map(
            ({ id, value }): RelationMatch => ({
              facetId: id,
              exclude: false,
              value,
            })
          ),
        };
        return newGroup;
      });
    };
  return (
    <div className="md:bg-white md:rounded-lg md:shadow-xs md:border border-gray-100 md:p-4 relative">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        {t("product.properties")}
        {/* <span className="ml-2 text-gray-500 text-lg">({fields.length})</span> */}
      </h3>
      {customQuery != null && (
        <div className="bg-slate-100 absolute z-10 top-1 right-1 rounded-md p-3 flex flex-col gap-2 items-center">
          <QueryProvider initialQuery={customQuery}>
            <QueryUpdater query={customQuery} />
            <TotalResultText className="text-sm" />
          </QueryProvider>
          <div className="flex button-group">
            <Link
              aria-label={t("common.search")}
              onClick={() => setQuery(customQuery)}
              to="/"
            >
              <Search className="size-5" />
            </Link>
            <button
              title={"Set as item requirement"}
              onClick={setInGroup("requiredForItem")}
            >
              <PlugZapIcon className="size-5" />
            </button>
            <button
              title={"Set as item requirement"}
              onClick={setInGroup("additionalQueries")}
            >
              <ListFilterPlus className="size-5" />
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {Object.entries(fields).map(([groupName, fields]) => {
          return (
            <div key={groupName} className="animating-element">
              <h3 className="text-xl font-bold my-6">{groupName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                {fields.map((field) => {
                  const isSelected = selected.some((s) => s.id === field.id);
                  return (
                    <div
                      key={`prop-${field.id}-${field.valueType}`}
                      className={cm(
                        "py-2 md:p-3 md:rounded-lg md:hover:bg-gray-50 transition-colors relative"
                        //field.hide && "opacity-50"
                      )}
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
                              "hover:text-gray-700 cursor-pointer size-5",
                              isSelected ? "text-blue-500" : "text-gray-500"
                            )}
                          />
                        </button>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className="text-lg font-semibold text-gray-900"
                          onClick={() => copyToClipboard(String(field.id))}
                        >
                          {field.name}
                          {field.description && (
                            <Tooltip
                              className="text-xs text-gray-600 bg-white shadow-lg rounded-md border border-gray-100 max-w-screen md:max-w-[240px] p-2 z-10"
                              popover={<span>{field.description}</span>}
                            >
                              <InfoIcon className="size-4 text-gray-500" />
                            </Tooltip>
                          )}
                        </h4>
                      </div>
                      <div className="flex justify-between gap-1">
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
                              className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium inline-flex items-center gap-1"
                              to="/"
                              onClick={() => {
                                if (
                                  field.linkedId != null &&
                                  field.value != null
                                ) {
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
                              {/* <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                {field.linkedId}
                              </span> */}
                            </Link>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
