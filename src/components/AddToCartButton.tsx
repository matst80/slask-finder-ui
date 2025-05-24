"use client";
import { useAddToCart } from "../hooks/cartHooks";
import { toEcomTrackingEvent } from "./toImpression";
import { ItemDetail } from "../lib/types";
import { Button } from "./ui/button";
import { Loader } from "./Loader";
import { useTranslations } from "../lib/hooks/useTranslations";

interface AddToCartButtonProps {
  details: ItemDetail;
}

export const AddToCartButton = ({ details }: AddToCartButtonProps) => {
  const { trigger: addToCart, isMutating } = useAddToCart();
  const t = useTranslations();

  return (
    <Button
      variant="default"
      onClick={() =>
        addToCart(
          { sku: details.sku, quantity: 1 },
          toEcomTrackingEvent(details, 0)
        )
      }
      disabled={isMutating} // Disable button when mutating
    >
      {isMutating ? <Loader size="sm" /> : <span>{t("cart.add")}</span>}
    </Button>
  );
};
