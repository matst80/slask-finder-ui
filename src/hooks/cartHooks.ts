import useSWR from "swr";
import { clearCart } from "../lib/datalayer/api";
import {
  addToCart,
  changeQuantity,
  getCart,
  removeFromCart,
} from "../lib/datalayer/cart-api";
import { useFetchMutation } from "../utils";
import { trackCart } from "../lib/datalayer/beacons";
import { Item } from "../lib/types";
import { useNotifications } from "../components/ui-notifications/useNotifications";

const cartKey = "/cart";

export const useCart = () => {
  return useSWR(cartKey, getCart, {
    keepPreviousData: true,
    errorRetryInterval: 50000,
  });
};

export const useResetCart = () => {
  return useFetchMutation(cartKey, () => clearCart().then(() => getCart()));
};

export const useAddMultipleToCart = () => {
  const { showNotification } = useNotifications();
  return useFetchMutation(cartKey, (items: (Item & { quantity?: number })[]) =>
    Promise.all(
      items.map((item) => {
        return addToCart({ sku: item.sku, quantity: item.quantity ?? 1 })
          .then(() => {
            showNotification({
              title: "Added to cart",
              message: `${item.title} has been added to your cart.`,
              variant: "success",
            });
            trackCart({
              item: item.id,
              quantity: item.quantity ?? 1,
              type: "add",
            });
          })
          .catch(() => {
            showNotification({
              title: "Error",
              message: `Failed to add ${item.title} to your cart.`,
              variant: "error",
            });
          });
      })
    )
  );
};

export const useAddToCart = (itemId: number) => {
  const { showNotification } = useNotifications();
  const { trigger, ...rest } = useFetchMutation(cartKey, addToCart);
  return {
    ...rest,
    trigger: async (item: { sku: string; quantity: number }) => {
      return trigger(item)
        .then((data) => {
          if (data) {
            // showNotification({
            //   title: "Added to cart",
            //   message: `Item added to your cart.`,
            //   variant: "success",
            // });
            trackCart({ item: itemId, quantity: item.quantity, type: "add" });
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
  const { trigger, ...rest } = useFetchMutation(cartKey, changeQuantity);
  return {
    ...rest,
    trigger: async (item: { id: number; quantity: number }) => {
      const data = await trigger(item);
      if (data) {
        trackCart({ item: item.id, quantity: item.quantity, type: "quantity" });
      }
      return data;
    },
  };
};

export const useRemoveFromCart = () => {
  const { trigger, ...rest } = useFetchMutation(cartKey, removeFromCart);
  return {
    ...rest,
    trigger: async (item: { id: number }) => {
      const data = await trigger(item);
      if (data) {
        trackCart({ item: item.id, quantity: 0, type: "remove" });
      }
      return data;
    },
  };
};
