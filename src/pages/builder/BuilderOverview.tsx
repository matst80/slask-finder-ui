import { Link } from "react-router-dom";
import { ResultItemInner } from "../../components/ResultItem";
import { Button, ButtonLink } from "../../components/ui/button";
import { ImpressionProvider } from "../../lib/hooks/ImpressionProvider";
import { useBuilderContext } from "./useBuilderContext";
import { useImpression } from "../../lib/hooks/useImpression";
import { trackClick } from "../../lib/datalayer/beacons";
import { ItemWithComponentId } from "./builder-types";
import { Plus, RefreshCw } from "lucide-react";
import { BuilderFooterBar } from "./components/BuilderFooterBar";
import { useFacetMap } from "../../hooks/searchHooks";
import { useMemo } from "react";
import { isDefined } from "../../utils";
import { flattenComponents } from "./builder-utils";
import { useBuilderStep } from "./useBuilderStep";

const SelectedItem = ({
  componentId,
  position,
  quantity = 1,
  maxQuantity,
  ...item
}: ItemWithComponentId & { position: number; maxQuantity: number }) => {
  const { setSelectedItems } = useBuilderContext();
  const { watch } = useImpression();

  const trackItem = () => trackClick(item.id, position);

  return (
    <Link
      ref={watch({ id: Number(item.id), position })}
      to={`/product/${item.id}`}
      key={`item-${item.id}`}
      className="group bg-white md:shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden relative snap-start flex-1 min-w-64 flex flex-col result-item hover:bg-linear-to-br hover:from-white hover:to-gray-50 border-b border-gray-200 md:border-b-0"
      onClick={trackItem}
    >
      <ResultItemInner {...item}>
        {quantity < maxQuantity && (
          <Button
            variant="default"
            size="icon"
            className="absolute bottom-3 right-3"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItems((prev) => {
                const newItems = [...prev];
                const index = newItems.findIndex(
                  (i) => i.componentId === componentId
                );
                if (index !== -1) {
                  newItems[index].quantity = quantity + 1;
                }
                return newItems;
              });
            }}
          >
            <Plus className="size-5" />
          </Button>
        )}
        <span className="text-lg absolute top-3 left-3">x{quantity}</span>
        <ButtonLink
          to={`/builder/component/${componentId}`}
          variant="secondary"
          size="icon"
          className="absolute top-3 right-3"
          onClick={(e) => {
            e.stopPropagation();
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
      const rule = rules
        .flatMap(flattenComponents)
        .find((rule) => rule.id === item.componentId);
      if (rule == null) {
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
      <div className="flex flex-col gap-1">
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
    </div>
  );
};

export const BuilderOverview = () => {
  const { selectedItems, rules, components } = useBuilderContext();
  const [unselectedComponents] = useBuilderStep(0);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <h1 className="text-2xl mb-6 font-bold">Builder Overview</h1>
        <p>Welcome to the Builder Overview page!</p>
        <p>This is where you can see an overview of your builder components.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ImpressionProvider>
            {selectedItems.map((item, i) => {
              const component = components[item.componentId];
              const maxQuantity =
                component?.maxQuantity != null
                  ? component.maxQuantity(selectedItems)
                  : 1;
              return (
                <SelectedItem
                  key={i}
                  position={i}
                  {...item}
                  maxQuantity={maxQuantity}
                />
              );
            })}
          </ImpressionProvider>
        </div>

        <div>
          {rules
            .filter((d) => d.type === "group")
            .map((rule, i) => (
              <div key={i} className="my-4">
                <h2 className="text-lg font-bold">{rule.title}</h2>
                {rule.description != null && <p>{rule.description}</p>}
                <div>
                  {rule.components.map((component, j) => {
                    const selected = selectedItems.some(
                      (selectedItem) =>
                        selectedItem.componentId === component.id
                    );
                    if (selected) {
                      return null;
                    }

                    return (
                      <div
                        key={j}
                        className="flex items-center justify-between border-b border-gray-200 py-2"
                      >
                        <span className="text-sm font-semibold">
                          {component.title}
                        </span>

                        <ButtonLink
                          to={`/builder/${component.type}/${component.id}`}
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
        {unselectedComponents.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold">Forgotten?</h2>
            <div className="flex flex-col md:flex-row gap-2 mt-2">
              {unselectedComponents.map((item, i) => (
                <ButtonLink
                  to={`/builder/${item.type}/${item.id}`}
                  variant="outline"
                  className="flex items-center gap-2"
                  key={i}
                >
                  {item.title}
                  <Plus className="size-5" />
                </ButtonLink>
              ))}
            </div>
          </div>
        )}
        {selectedItems.length > 0 && (
          <p className="bg-blue-50 p-4 rounded-lg my-6">
            <SpecificationSummary />
          </p>
        )}
        {/* <div className="mt-6 mb-20">
          <p className="font-bold text-lg">
            Total price: <PriceValue value={sum * 100} />
          </p>
        </div> */}
      </div>
      <BuilderFooterBar />
    </>
  );
};
