import useSWR from "swr";
import {
  addToCart,
  changeQuantity,
  clearCart,
  getCart,
  removeFromCart,
} from "../lib/datalayer/api";
import { useFetchMutation } from "../utils";

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

export const useAddToCart = () => {
  return useFetchMutation(cartKey, addToCart);
};

export const useChangeQuantity = () => {
  return useFetchMutation(cartKey, changeQuantity);
};

export const useRemoveFromCart = () => {
  return useFetchMutation(cartKey, removeFromCart);
};
