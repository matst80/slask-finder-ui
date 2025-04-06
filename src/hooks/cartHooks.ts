import useSWR from "swr";
import {
  addToCart,
  changeQuantity,
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

export const useAddToCart = () => {
  return useFetchMutation(cartKey, addToCart);
};

export const useChangeQuantity = () => {
  return useFetchMutation(cartKey, changeQuantity);
};

export const useRemoveFromCart = () => {
  return useFetchMutation(cartKey, removeFromCart);
};
