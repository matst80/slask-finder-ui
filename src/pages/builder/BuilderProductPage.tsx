import { useLoaderData } from "react-router-dom";
import { Price } from "../../components/Price";
import { Properties } from "../../components/Properties";
import { makeImageUrl } from "../../utils";
import { StockList } from "../../components/StockList";
import { Button, ButtonLink } from "../../components/ui/button";
import { useBuilderContext } from "./useBuilderContext";
import { isParentId, ItemWithComponentId } from "./builder-types";
import { trackAction } from "../../lib/datalayer/beacons";
import { BuilderFooterBar } from "./components/BuilderFooterBar";
import { useBuilderStep } from "./useBuilderStep";
import { useTranslations } from "../../lib/hooks/useTranslations";
import { Loader } from "../../components/Loader";
import { useTracking } from "../../lib/hooks/TrackingContext";
import { toEcomTrackingEvent } from "../../components/toImpression";

export const ComponentDetails = (details: ItemWithComponentId) => {
  const { setSelectedItems, selectedItems } = useBuilderContext();
  const [unselectedComponents, nextComponent] = useBuilderStep(
    details.componentId
  );
  const t = useTranslations();
  if (!details) return null;
  const {
    title,
    id,
    componentId,
    img,
    bp,
    stockLevel,
    stock,
    buyable,
    buyableInStore,
    parentId: itemParentId,
    values,
    disclaimer,
  } = details;
  const queryParentId =
    new URLSearchParams(globalThis.location.search).get("parentId") ??
    undefined;
  const parentId = isParentId(queryParentId) ? queryParentId : itemParentId;
  const isSelected = selectedItems.some((d) => d.id === id);
  const { track } = useTracking();

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
          {/* Image Section */}

          <div className="flex items-center justify-center">
            <img
              className="max-w-full h-auto mix-blend-multiply object-contain product-image"
              src={makeImageUrl(img)}
              alt={title}
            />
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 product-name">
                {title}
              </h2>
              {bp && (
                <ul className="space-y-3 text-gray-600">
                  {bp.split("\n").map((txt) => (
                    <li key={txt} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {txt}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Price and Cart Section */}
            {(buyable || buyableInStore) && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 text-sm">
                      {t("common.price")}
                    </span>
                    <div className="text-4xl font-bold text-gray-900">
                      <Price values={values} disclaimer={disclaimer} />
                    </div>
                  </div>
                  <div className="flex items-end justify-end">
                    <Button
                      variant={isSelected ? "outline" : "default"}
                      onClick={() => {
                        setSelectedItems((prev) => [
                          ...prev.filter((d) =>
                            parentId == null
                              ? d.componentId != componentId
                              : d.parentId != parentId
                          ),
                          ...(isSelected
                            ? []
                            : [
                                {
                                  ...details,
                                  parentId,
                                  componentId,
                                },
                              ]),
                        ]);
                        requestAnimationFrame(() => {
                          const ecomItem = toEcomTrackingEvent(details, 1);
                          track({
                            type: "click",
                            item: ecomItem,
                          });
                          //trackClick(id, 1);
                          trackAction({
                            item: ecomItem,
                            action: "select_component",
                            reason: `builder_${componentId}`,
                          });
                        });
                      }}
                    >
                      {t(isSelected ? "builder.remove" : "builder.select")}
                    </Button>
                  </div>
                </div>
                {unselectedComponents.length > 0 && isSelected && (
                  <div className="mt-6 animate-pop">
                    <div className="flex flex-col flex-wrap w-full md:flex-row gap-2 mt-2">
                      {unselectedComponents
                        .filter((d) => d.id != componentId)
                        .map((item, i) => (
                          <ButtonLink
                            to={`/builder/${item.type}/${item.id}`}
                            variant={
                              item.id === nextComponent?.id
                                ? "default"
                                : "outline"
                            }
                            className="flex items-center gap-2"
                            key={i}
                          >
                            {item.title}
                          </ButtonLink>
                        ))}
                    </div>
                  </div>
                )}
                <StockList stock={stock} stockLevel={stockLevel} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="mt-6 space-y-6 md:mt-16 md:space-y-16 animating-element">
          <Properties values={details.values} />
        </div>
      </div>
      <BuilderFooterBar />
    </>
  );
};

export const BuilderProductPage = () => {
  const details = useLoaderData() as ItemWithComponentId | null;

  return (
    <div className="container mx-auto px-4 py-8">
      {details ? (
        <ComponentDetails {...details} />
      ) : (
        <Loader size="lg" variant="overlay" />
      )}
    </div>
  );
};
