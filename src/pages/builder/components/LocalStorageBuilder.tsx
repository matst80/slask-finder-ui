"use client";
import { useAddProductToCart } from "@domains/cart/cart-hooks";
import { useIsClient } from "@utils/useIsClient";
import { apiFetch } from "@utils/api-fetch";
import { useSiteContext } from "@components/SettingsProvider";
import { Result, SiteContext } from "@utils/service-types";
import { ApiError, toJson } from "@utils/api-utils";
import { useState } from "react";
import {
  BuilderContent,
  BuilderProvider,
  CartArticle,
  ItemWithComponentId,
} from "./builder";
import { componentRules } from "./rules";

const saveBuildToLocalStorage = (data: ItemWithComponentId[]) => {
  globalThis.localStorage?.setItem("build", JSON.stringify(data));
};

const loadBuildFromLocalStorage = (): ItemWithComponentId[] => {
  const data = globalThis.localStorage?.getItem("build");
  return data ? JSON.parse(data) : [];
};

export const useSendToStore = (storeId?: number | string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | ApiError | null>(null);
  const siteContext = useSiteContext();
  return {
    sendToStore: async (items: { sku: string; quantity: number }[]) => {
      if (!storeId) {
        setError("No storeId provided");
        return Result.fail<ApiError>({ message: "No storeId provided" });
      }
      setLoading(true);
      setError(null);
      return apiFetch(siteContext, `/api/cart/send-to-store/${storeId}`, {
        method: "POST",
        body: JSON.stringify(
          items.map(({ sku }) => ({ articleNumber: sku, quantity: 1 })),
        ),
      })
        .then((d) =>
          toJson<{ basketId: string; data: { basketId: string } }>(d),
        )
        .then((d) => {
          if (!d.success) {
            setError(d.error);
          }
          return d;
        })
        .finally(() => setLoading(false));

      //.then(console.log);
    },
    error,
    loading,
  };
};

export const sendItemsToStore =
  (storeId: number, siteContext: SiteContext) =>
  (items: { sku: string; quantity: number }[]) => {
    apiFetch(siteContext, `/api/cart/send-to-store/${storeId}`, {
      method: "POST",
      body: JSON.stringify(
        items.map(({ sku }) => ({ articleNumber: sku, quantity: 1 })),
      ),
    }).then((d) => d.json());
    //.then(console.log);
  };

export const LocalStorageBuilder = () => {
  const siteContext = useSiteContext();
  const isClient = useIsClient();
  const { trigger, error } = useAddProductToCart({
    add_to_cart_location: "builder",
    showPopupSku: false,
  });
  const addToCart = async (items: CartArticle[]) => {
    trigger({ articles: items });
  };
  const saveBuild = (items: ItemWithComponentId[]) => {
    saveBuildToLocalStorage(items);
  };

  const initialItems = loadBuildFromLocalStorage();
  if (!isClient) return null;
  return (
    <BuilderProvider
      initialRules={componentRules}
      initialItems={initialItems}
      //globalFilters={{ stock: ["2001"] }}
      onAddToCart={addToCart}
      onSelectionChange={saveBuild}
    >
      <BuilderContent />
      {/* <Button
        onClick={() =>
          sendItemsToStore(
            2001,
            siteContext,
          )(
            loadBuildFromLocalStorage().map((d) => ({
              sku: d.sku,
              quantity: 1,
            })),
          )
        }
      >
        Betala i butik
      </Button> */}
    </BuilderProvider>
  );
};
