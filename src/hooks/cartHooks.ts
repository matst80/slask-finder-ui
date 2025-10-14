import useSWR from "swr";
import { clearCart } from "../lib/datalayer/api";
import {
  addToCart,
  addToCartMultiple,
  addVoucher,
  changeQuantity,
  getCart,
  removeFromCart,
} from "../lib/datalayer/cart-api";
import { useCartFetchMutation, useFetchMutation } from "../utils";
import { trackCart } from "../lib/datalayer/beacons";
import { BaseEcomEvent, Item } from "../lib/types";
import { useNotifications } from "../components/ui-notifications/useNotifications";
import { useCookieAcceptance } from "../CookieConsent";

const cartKey = "/cart";

export const useCart = () => {
  return useSWR(cartKey, getCart, {
    keepPreviousData: true,
    revalidateOnFocus: true,
    errorRetryInterval: 5000,
  });
};

export const useResetCart = () => {
  return useFetchMutation(cartKey, () => clearCart().then(() => getCart()));
};

export const useAddVoucher = () => {
  const { showNotification } = useNotifications();
  return useCartFetchMutation(cartKey, (voucherCode: string) =>
    addVoucher(voucherCode)
      .then((data) => {
        showNotification({
          title: "Success",
          message: `Added voucher ${voucherCode} to cart.`,
          variant: "success",
        });
        return data;
      })
      .catch((error) => {
        //console.warn(error);
        showNotification({
          title: "Error",
          message: `Failed to add voucher ${voucherCode} to cart.`,
          variant: "error",
        });
        return error;
      }),
  );
};

export const useAddMultipleToCart = () => {
  const { showNotification } = useNotifications();
  return useCartFetchMutation(
    cartKey,
    (items: (Item & { quantity?: number })[]) =>
      addToCartMultiple(
        items.map((d) => ({ sku: d.sku, quantity: d.quantity || 1 })),
      )
        .then((data) => {
          showNotification({
            title: "Success",
            message: `Added ${items.length} items to cart.`,
            variant: "success",
          });
          return data;
        })
        .catch((error) => {
          //console.warn(error);
          showNotification({
            title: "Error",
            message: `Failed to add ${items.length} items to cart.`,
            variant: "error",
          });
          return error;
        }),
  );
};

export const useAddToCart = () => {
  const { accepted } = useCookieAcceptance();
  const { showNotification } = useNotifications();
  const { trigger, ...rest } = useCartFetchMutation(cartKey, addToCart);
  return {
    ...rest,
    trigger: async (
      item: { sku: string; quantity: number; storeId?: string },
      trackingItem: BaseEcomEvent,
    ) => {
      if (accepted === "none" || accepted === null) {
        showNotification({
          title: "Error",
          message: `No use in adding to cart if you don't accept essential cookies.`,
          variant: "error",
        });
        return;
      }
      return trigger(item)
        .then((data) => {
          if (data) {
            // showNotification({
            //   title: "Added to cart",
            //   message: `Item added to your cart.`,
            //   variant: "success",
            // });
            trackCart({
              ...trackingItem,
              quantity: item.quantity,
              type: "add",
            });
          }
          return data;
        })
        .catch(() => {
          showNotification({
            title: "Error",
            message: `Failed to add item to your cart.`,
            variant: "error",
          });
        });
    },
  };
};

export const useChangeQuantity = () => {
  const { trigger, ...rest } = useCartFetchMutation(cartKey, changeQuantity);
  return {
    ...rest,
    trigger: async (id: number, quantity: number, item: BaseEcomEvent) => {
      const data = await trigger({ id, quantity });
      if (data) {
        trackCart({ ...item, quantity, type: "quantity" });
      }
      return data;
    },
  };
};

export const useRemoveFromCart = () => {
  const { trigger, ...rest } = useCartFetchMutation(cartKey, removeFromCart);
  return {
    ...rest,
    trigger: async (id: number, item: BaseEcomEvent) => {
      const data = await trigger({ id });
      if (data) {
        trackCart({ ...item, quantity: 0, type: "remove" });
      }
      return data;
    },
  };
};
