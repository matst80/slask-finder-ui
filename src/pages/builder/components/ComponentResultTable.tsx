import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Item, ItemValues } from "../../../lib/types";
import { useQuery } from "../../../lib/hooks/useQuery";
import { useBuilderContext } from "../useBuilderContext";
import { ImpressionProvider } from "../../../lib/hooks/ImpressionProvider";
import { useImpression } from "../../../lib/hooks/useImpression";
import { trackClick } from "../../../lib/datalayer/beacons";
import { ComponentId, FacetId, Issue } from "../builder-types";
import { cm, isDefined, makeImageUrl } from "../../../utils";
import { InfiniteHitList } from "../../../components/InfiniteHitList";
import { useFacetMap } from "../../../hooks/searchHooks";
import { Loader } from "lucide-react";
import { GroupRenderer } from "./ItemDetails";
import { Price } from "../../../components/Price";

const TableRowItem = ({
  item,
  componentId,
  isSelected,
  validator,
  importantFacets,
  position,
}: {
  item: Item;
  componentId: ComponentId;
  importantFacets: FacetId[];
  isSelected: boolean;
  validator?: (values: ItemValues) => Issue[];
  position: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { watch } = useImpression();

  const trackItem = () => trackClick(item.id, position);
  const issues = validator?.(item.values) ?? [];
  const hasError = issues.some((d) => d.type === "error");
  const isValid = issues.length === 0;
  const qs = new URLSearchParams(window.location.search);
  const url = `/builder/product/${componentId}/${item.id}?${qs.toString()}`;

  return (
    <>
      <tr
        ref={watch({ id: item.id, position })}
        onClick={() => setIsExpanded((prev) => !prev)}
        className={cm(
          "transition-all duration-300",
          isSelected ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-50",
          !isValid && hasError
            ? "opacity-50"
            : !isValid
            ? "opacity-75"
            : "opacity-100"
        )}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-16 w-16 rounded overflow-hidden">
            {item.img && (
              <img
                src={makeImageUrl(item.img)}
                alt={item.title}
                className="h-full w-full object-contain aspect-square mix-blend-multiply"
              />
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">{item.title}</div>
          <div className="text-sm text-gray-500 flex flex-col">
            {item.bp.split("\n").map((txt, idx) => (
              <span key={idx}>{txt}</span>
            ))}
          </div>
        </td>

        {importantFacets.map((id) => (
          <td key={id} className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">
              {item.values[id] || "No Value"}
            </div>
          </td>
        ))}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            <Price
              size="medium"
              values={item.values}
              disclaimer={item.disclaimer}
            />
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex space-x-2">
            {isValid && (
              <Link
                to={url}
                onClick={trackItem}
                className="text-blue-600 hover:text-blue-900"
              >
                Select
              </Link>
            )}
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="animate-pop">
          <td
            colSpan={4 + importantFacets.length}
            className="px-6 py-4 bg-gray-50"
          >
            <GroupRenderer values={item.values} />
          </td>
        </tr>
      )}
    </>
  );
};

export const ComponentResultTable = ({
  componentId,
  importantFacets,
  validator,
}: {
  componentId: ComponentId;
  importantFacets: FacetId[];
  validator?: (values: ItemValues) => Issue[];
}) => {
  const { data } = useFacetMap();
  const { isLoading, hits } = useQuery();
  const { selectedItems } = useBuilderContext();
  const facets = useMemo(
    () =>
      importantFacets
        ?.map((facet) => {
          return data?.[facet];
        })
        .filter(isDefined),
    [data, importantFacets]
  );

  if (isLoading && hits.length < 1) {
    return <Loader size={"lg"} />;
  }

  const selectedId = selectedItems.find(
    (i) => i.componentId === componentId
  )?.id;

  if (hits == null || hits.length < 1) {
    return <div>No matching components</div>;
  }

  return (
    <ImpressionProvider>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Image
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              {facets?.map((facet) => (
                <th
                  key={facet.id}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {facet.name}
                </th>
              ))}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Price
              </th>

              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <InfiniteHitList>
              {({ position, ...item }) => (
                <TableRowItem
                  key={item.id}
                  item={item}
                  importantFacets={importantFacets}
                  componentId={componentId}
                  isSelected={selectedId === item.id}
                  validator={validator}
                  position={position}
                />
              )}
            </InfiniteHitList>
          </tbody>
        </table>
      </div>
    </ImpressionProvider>
  );
};
