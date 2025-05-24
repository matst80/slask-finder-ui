"use client";
import { useState } from "react";
import { makeImageUrl } from "../utils";
import { ItemDetail } from "../lib/types";
import { Store } from "../lib/datalayer/stores";
import { CompareButton } from "./ResultItem";
import { useAddToCart } from "../hooks/cartHooks";
import { Price } from "./Price";
import { Button } from "./ui/button";
import { useTranslations } from "../lib/hooks/useTranslations";
import { GroupedProperties } from "./GroupedProperties";
import { Loader } from "./Loader";
import { BotMessageSquare } from "lucide-react";
import { toEcomTrackingEvent } from "./toImpression";
import { Stars } from "./Stars";
import { useProductData } from "../lib/utils";
import { Sidebar } from "./ui/sidebar";
import { RelatedItems } from "./itemdetails/RelatedItems";
import { CompatibleButton } from "./itemdetails/CompatibleButton";
import { RelationGroups } from "./itemdetails/RelationGroups";
import { PopulateAdminDetails } from "./itemdetails/PopulateAdminDetails";
import { BreadCrumbs } from "./itemdetails/BreadCrumbs";
import { AiChatForCurrentProduct } from "./itemdetails/AiChatForCurrentProduct";
import { StockList } from "./StockList";

export type StoreWithStock = Store & {
  stock: string;
  distance: number | null;
};

export const ItemDetails = (details: ItemDetail) => {
  const { trigger: addToCart, isMutating } = useAddToCart();
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  if (!details) return null;
  const {
    title,
    img,
    bp,
    stock,
    buyable,
    description,
    buyableInStore,
    id,
    values,
    disclaimer,
  } = details;
  const { stockLevel, rating } = useProductData(values);

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
          {/* Image Section */}

          <div className="flex flex-col items-center justify-center">
            <img
              className="max-w-full mix-blend-multiply h-auto object-contain product-image"
              src={makeImageUrl(img)}
              alt={title}
            />
            {description != null && description.length > 1 && (
              <p className="leading-7 mt-6">{description}</p>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 product-name">
                {title}
              </h2>
              {rating != null && (
                <div className="my-3">
                  <Stars
                    rating={rating.rating}
                    numberOfRatings={rating.numberOfRatings}
                    showText={true}
                  />
                </div>
              )}
              {bp && (
                <ul className="space-y-3 text-gray-600">
                  {bp.split("\n").map((txt) =>
                    txt.length > 1 ? (
                      <li key={txt} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {txt}
                      </li>
                    ) : null
                  )}
                </ul>
              )}
            </div>
            <CompatibleButton values={values} /> {/* Added CompatibleButton */}
            {/* Price and Cart Section */}
            {(buyable || buyableInStore) && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-4 items-end">
                  <div>
                    <span className="text-gray-500 text-sm">
                      {t("common.price")}
                    </span>
                    <div className="text-4xl font-bold text-gray-900">
                      <Price values={values} disclaimer={disclaimer} />
                    </div>
                  </div>

                  <Button
                    variant="default"
                    onClick={() =>
                      addToCart(
                        { sku: details.sku, quantity: 1 },
                        toEcomTrackingEvent(details, 0)
                      )
                    }
                  >
                    {isMutating ? (
                      <Loader size="sm" />
                    ) : (
                      <span>{t("cart.add")}</span>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <CompareButton
                    item={details}
                    className="font-medium rounded-sm focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:cursor-not-allowed border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white/20 px-3 py-1 text-sm my-2"
                  />
                  <PopulateAdminDetails id={id} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-1"
                    title="Ask AI assistant"
                    onClick={() => setOpen((p) => !p)}
                  >
                    <BotMessageSquare className="size-5" />
                  </Button>
                </div>
                <StockList stock={stock} stockLevel={stockLevel} />
              </div>
            )}
          </div>
        </div>
        <Sidebar side="right" open={open} setOpen={setOpen}>
          <div className="bg-white flex flex-col overflow-y-auto py-6 px-4 h-full w-full max-w-full md:max-w-lg">
            {open && <AiChatForCurrentProduct {...details} />}
          </div>
        </Sidebar>
        {/* Bottom Sections */}
        <div className="mt-6 space-y-6 md:mt-6 md:space-y-16">
          <BreadCrumbs values={values} />
          <RelationGroups values={values} id={id} />

          <GroupedProperties values={details.values} />

          <div className="animating-element">
            <h3 className="text-2xl font-bold text-gray-900 pb-6 mb-8">
              {t("common.similar")}
            </h3>
            <RelatedItems id={details.id} />
          </div>
        </div>
      </div>
    </>
  );
};
