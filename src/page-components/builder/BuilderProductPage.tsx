import { Price } from "../../components/Price";
import { makeImageUrl } from "../../utils";
import { StockList } from "../../components/StockList";
import { ItemWithComponentId } from "./builder-types";
import { BuilderFooterBar } from "./components/BuilderFooterBar";
import { GroupedProperties } from "../../components/GroupedProperties";
import { BuilderOtherComponents } from "./BuilderOtherComponents";
import { AddToBuildButton } from "./AddToBuildButton";
import { ssrTranslations } from "../../components/ssrTranslations";
import { swedish } from "../../translations/swedish";
import { convertProductValues } from "../../lib/utils";

export const ComponentDetails = (details: ItemWithComponentId) => {
  const t = ssrTranslations(swedish);

  const {
    title,
    id,
    componentId,
    img,
    bp,

    stock,
    buyable,
    buyableInStore,
    parentId,
    values,
    disclaimer,
  } = details;

  // const isSelected = selectedItems.some((d) => d.id === id);

  const { stockLevel } = convertProductValues(values);

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
                    <AddToBuildButton
                      itemParentId={parentId}
                      id={id}
                      componentId={componentId}
                      details={details}
                    />
                  </div>
                </div>
                <BuilderOtherComponents componentId={componentId} />

                <StockList stock={stock} stockLevel={stockLevel} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="mt-6 space-y-6 md:mt-6 md:space-y-16 animating-element">
          <GroupedProperties values={details.values} />
        </div>
      </div>
      <BuilderFooterBar />
    </>
  );
};

export const BuilderProductPage = (details: ItemWithComponentId) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <ComponentDetails {...details} />
    </div>
  );
};
