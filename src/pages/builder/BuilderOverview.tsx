import { Link } from "react-router-dom";
import { ResultItemInner } from "../../components/ResultItem";
import { ButtonLink } from "../../components/ui/button";
import { ImpressionProvider } from "../../lib/hooks/ImpressionProvider";
import { useBuilderContext } from "./useBuilderContext";
import { useImpression } from "../../lib/hooks/useImpression";
import { trackClick } from "../../lib/datalayer/beacons";
import { ItemWithComponentId } from "./builder-types";
import { PriceValue } from "../../components/Price";
import { Plus, RefreshCw } from "lucide-react";
import { BuilderFooterBar } from "./components/BuilderFooterBar";
import { useFacetMap } from "../../hooks/searchHooks";
import { useMemo } from "react";
import { isDefined } from "../../utils";

const SelectedItem = ({
  componentId,
  position,
  ...item
}: ItemWithComponentId & { position: number }) => {
  const { watch } = useImpression();
  const { setSelectedComponentId } = useBuilderContext();
  const trackItem = () => trackClick(item.id, position);

  return (
    <Link
      ref={watch({ id: Number(item.id), position })}
      to={`/product/${item.id}`}
      key={`item-${item.id}`}
      className="group bg-white md:shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative snap-start flex-1 min-w-64 flex flex-col result-item hover:bg-gradient-to-br hover:from-white hover:to-gray-50 border-b border-gray-200 md:border-b-0"
      onClick={trackItem}
    >
      <ResultItemInner {...item}>
        <ButtonLink
          to={`/builder/component/${componentId}`}
          variant="secondary"
          size="icon"
          className="absolute top-3 right-3"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponentId(componentId);
          }}
        >
          <RefreshCw className="size-5" />
        </ButtonLink>
      </ResultItemInner>
    </Link>
  );
};

const SpecificationSummary = () => {
  const { selectedItems, rules } = useBuilderContext();
  const { data } = useFacetMap();
  const specifications = useMemo(() => {
    return selectedItems.flatMap((item) => {
      const rule = rules.find((rule) => rule.id === item.componentId);
      if (rule == null || rule.type !== "component") {
        return [];
      }
      return (
        Array.from(
          new Set([...(rule.topFilters ?? []), ...(rule.importantFacets ?? [])])
        )
          ?.map((facetId) => {
            const spec = data?.[facetId];
            const value = item.values[facetId];
            if (spec == null || value == null) {
              return null;
            }

            return {
              componentId: item.componentId,
              componentTitle: rule.title,
              id: facetId,
              name: spec.name,
              value: Array.isArray(value) ? value.join(", ") : String(value),
            };
          })
          .filter(isDefined) ?? []
      );
    });
  }, [rules, selectedItems, data]);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-bold">Specifications</h2>
      {specifications.map(
        ({ componentId, id, name, value, componentTitle }) => (
          <div
            key={`${componentId}-${id}`}
            className="flex items-center justify-between gap-4 border-b border-blue-200"
          >
            <span className="text-sm font-semibold">{name}</span>
            <span className="text-sm flex-1">{value}</span>
            <span className="text-sm hidden md:inline-flex">
              {componentTitle}
            </span>
          </div>
        )
      )}
    </div>
  );
};

export const BuilderOverview = () => {
  const { selectedItems, sum, rules } = useBuilderContext();
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl mb-6 font-bold">Builder Overview</h1>
        <p>Welcome to the Builder Overview page!</p>
        <p>This is where you can see an overview of your builder components.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ImpressionProvider>
            {selectedItems.map((item, i) => (
              <SelectedItem key={i} position={i} {...item} />
            ))}
          </ImpressionProvider>
        </div>
        <p className="bg-blue-50 p-4 rounded-lg my-6">
          <SpecificationSummary />
        </p>
        <div>
          {rules
            .filter((d) => d.type === "group")
            .map((rule, i) => (
              <div key={i} className="my-4">
                <h2 className="text-lg font-bold">{rule.title}</h2>
                {rule.description != null && <p>{rule.description}</p>}
                <div>
                  {rule.components.map((item, j) => {
                    const selected = selectedItems.find(
                      (selectedItem) => selectedItem.componentId === item.id
                    );
                    return (
                      <div
                        key={j}
                        className="flex items-center justify-between border-b border-gray-200"
                      >
                        <span className="text-sm font-semibold">
                          {item.title}{" "}
                          {selected != null && `(${selected.title})`}
                        </span>
                        <ButtonLink
                          to={`/builder/${item.type}/${item.id}`}
                          variant="outline"
                          size="icon"
                          className="ml-2"
                        >
                          {selected ? (
                            <RefreshCw className="size-5" />
                          ) : (
                            <Plus className="size-5" />
                          )}
                        </ButtonLink>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
        <div className="mt-6 mb-20">
          <p className="font-bold text-lg">
            Total price: <PriceValue value={sum * 100} />
          </p>
        </div>
      </div>
      <BuilderFooterBar />
    </>
  );
};
