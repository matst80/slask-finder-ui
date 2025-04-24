import { useMemo } from "react";
import { useFacetMap } from "../../hooks/searchHooks";
import { cm } from "../../utils";
import { Issue } from "./builder-types";

export const IssueList = ({ issues }: { issues: Issue[] }) => {
  const { data } = useFacetMap();
  const toShow = useMemo(
    () =>
      issues?.map((issue) => {
        const facet = data?.[issue.facetId];
        return {
          ...issue,
          name: facet?.name ?? "...",
        };
      }) ?? [],
    [issues, data]
  );
  if (issues.length < 1 || data == null) {
    return null;
  }
  return (
    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center gap-1 p-3">
      {toShow.map((issue, idx) => (
        <span
          key={idx}
          title={String(issue.facetId)}
          className={cm(
            "text-xs overflow-hidden text-ellipsis line-clamp-1 px-2 py-1 rounded-md",
            issue.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-indigo-100 text-indigo-800"
          )}
        >
          {issue.message} in "{issue.name}"
        </span>
      ))}
    </div>
  );
};
