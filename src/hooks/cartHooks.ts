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

export const useAddToCart = (itemId: number) => {
  const { trigger, ...rest } = useFetchMutation(cartKey, addToCart);
  return {
    ...rest,
    trigger: async (item: { sku: string; quantity: number }) => {
      const data = await trigger(item);
      if (data) {
        trackCart({ item: itemId, quantity: item.quantity, type: "add" });
      }
      return data;
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
