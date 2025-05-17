import { MessageSquareMore, X } from "lucide-react";
import { useCompareContext } from "../lib/hooks/CompareProvider";
import { cm, isDefined, makeImageUrl } from "../utils";
import { useCallback, useMemo, useState } from "react";
import { useFacetMap } from "../hooks/searchHooks";
import { FacetListItem, Item } from "../lib/types";
import { ResultItemInner } from "./ResultItem";
import { Dialog } from "./ui/dialog";
import { matchValue } from "../lib/utils";
import { convertItemSimple } from "../pages/tools";
import {
  AiShoppingProvider,
  MessageList,
  QueryInput,
} from "../pages/AiShopper";

const FacetCells = ({
  facet,
  showDifferances,
  values,
}: {
  facet: FacetListItem;
  showDifferances: boolean;
  values: (string | string[] | number | undefined)[];
}) => {
  const isSameValue = values.every((v) => matchValue(v, values[0] ?? ""));
  if (showDifferances && isSameValue) {
    return null;
  }
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-3 py-1 lg:px-5 lg:py-3 font-medium text-gray-700 text-sm">
        {facet.name}
      </td>
      {values.map((v, idx) => (
        <td
          key={idx}
          className={`px-3 py-1 lg:py-3 ${
            isSameValue ? "text-gray-500" : "font-semibold text-gray-800"
          }`}
        >
          {v != null ? (Array.isArray(v) ? v.join(",") : String(v)) : ""}
        </td>
      ))}
    </tr>
  );
};

const AiChatForCompare = ({ items }: { items: Item[] }) => {
  const { data: facets } = useFacetMap();
  const convertItem = useCallback(convertItemSimple(facets ?? {}), [facets]);
  const contextItems = useMemo(() => {
    return items.map(convertItem).slice(0, 10);
  }, [items, facets]);
  if (contextItems.length === 0) {
    return null;
  }
  return (
    <AiShoppingProvider
      messages={[
        {
          role: "system",
          content:
            "You should help the user to show the main differences between these products!\n```json\n" +
            JSON.stringify(contextItems) +
            "\n```",
        },
      ]}
    >
      <div className="flex flex-col gap-6 flex-1">
        <div className="flex-1 overflow-auto">
          <MessageList />
        </div>

        <QueryInput placeholderText="Ask questions regarding these products" />
      </div>
    </AiShoppingProvider>
  );
};

const ignoredFacets = new Set([1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 14]);

export const CompareOverlay = () => {
  const { data } = useFacetMap();
  const { items, setItems, matchingFacetIds, diffWarning } =
    useCompareContext();
  const [open, setOpen] = useState(false);
  const [showDifferances, setShowDifferences] = useState(false);

  const facets = useMemo(() => {
    return Array.from(matchingFacetIds)
      .filter((id) => !ignoredFacets.has(id))
      .map((id) => data?.[id])
      .filter(isDefined)
      .filter((d) => !d.hide && !d.internal)
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
  }, [matchingFacetIds, data]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full shadow-lg bg-gray-100/50 border-t border-gray-200 transition-all duration-300 z-40">
      <div className="container mx-auto flex justify-end">
        <ul className="flex w-full md:w-auto border-collapse overflow-auto">
          {items.map((item) => (
            <li
              key={item.id}
              className="p-1 lg:p-2 bg-gradient-to-br border-collapse from-white to-gray-100 flex-1 min-w-[180px] border-l last:border-r border-gray-300"
            >
              <div className="flex items-center gap-1 relative">
                <img
                  src={makeImageUrl(item.img)}
                  alt={item.title}
                  className="size-12 lg:size-16 aspect-square object-contain bg-white rounded mix-blend-multiply"
                />
                <span className="text-sm font-medium flex-1 line-clamp-2 overflow-ellipsis">
                  {item.title}
                </span>
                <button
                  className="text-gray-600 transition-all hover:text-red-500 p-1 rounded-full hover:bg-gray-100 absolute top-0 right-0"
                  onClick={() => {
                    setItems((prev) => prev.filter((i) => i.id !== item.id));
                  }}
                  aria-label="Remove item"
                >
                  <X className="size-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {items.length > 1 && (
          <button
            className={cm(
              "text-white px-4 lg:px-6 py-2 font-medium transition-colors shadow-sm flex-shrink-0 flex gap-1 items-center justify-center",
              diffWarning
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            )}
            onClick={() => setOpen(true)}
          >
            <MessageSquareMore className="size-5" />
            <span className="hidden lg:block">Compare ({items.length})</span>
          </button>
        )}
      </div>

      {open && (
        <Dialog open={open} setOpen={setOpen}>
          <div className="bg-white min-w-[90vw] max-h-[90vh] rounded-lg overflow-hidden flex flex-col shadow-xl">
            {/* <h2 className="text-xl font-bold text-gray-800">Comparison</h2> */}
            <button
              className="text-black hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 absolute top-3 right-3 z-50"
              onClick={() => setOpen(false)}
              aria-label="Close dialog"
            >
              <X className="size-5" />
            </button>

            <div className="overflow-auto flex-1">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-40">
                  <tr>
                    <th className="px-3 py-1 lg:px-5 lg:py-3 text-left bg-gray-50 border-b border-gray-200"></th>
                    {items.map((item) => (
                      <th
                        key={item.id}
                        className="px-3 py-1 lg:py-3 text-left bg-gray-50 border-b border-gray-200"
                      >
                        <span className="line-clamp-1 overflow-ellipsis font-semibold">
                          {item.title}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {facets.map((facet) => (
                    <FacetCells
                      facet={facet}
                      showDifferances={showDifferances}
                      values={items.map((item) => item.values[facet.id])}
                      key={facet.id}
                    />
                  ))}
                </tbody>
                <tfoot className=" bg-white border-t border-gray-200">
                  <tr>
                    <td>&nbsp;</td>
                    {items.map((item) => (
                      <td key={item.id}>
                        <div className="p-3 rounded-lg relative">
                          <ResultItemInner {...item} />
                        </div>
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
              <div className="p-4 md:p-6">
                <AiChatForCompare items={items} />
              </div>
            </div>

            <div className="flex justify-end p-3 border-t border-gray-200">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors mr-2"
                onClick={() => {
                  setShowDifferences((prev) => !prev);
                }}
              >
                Toggle diff
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                onClick={() => {
                  // Add an action here if needed
                  setItems([]);
                  setOpen(false);
                }}
              >
                Done
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
