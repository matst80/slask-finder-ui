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
        trackCart({ item: itemId, quantity: item.quantity });
      }
      return data;
    },
  };
};

export const useChangeQuantity = () => {
  return useFetchMutation(cartKey, changeQuantity);
};

export const useRemoveFromCart = () => {
  return useFetchMutation(cartKey, removeFromCart);
};
