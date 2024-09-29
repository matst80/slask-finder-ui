import useSWR from "swr";
import useSWRMutation, { SWRMutationConfiguration } from "swr/mutation";
import { addToCart, changeQuantity, getCart, removeFromCart } from "./api";

const cartKey = "/cart";

export const useCart = () => {
  return useSWR(cartKey, getCart, {});
};

const useFetchMutation = <T, U>(
  key: string,
  fn: (payload: U) => Promise<T>,
  config?: SWRMutationConfiguration<T, Error, string, U>
) => {
  return useSWRMutation(key, (_, { arg }) => fn(arg), {
    ...config,
    populateCache: true,
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
