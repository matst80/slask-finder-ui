import useSWRMutation, { SWRMutationConfiguration } from "swr/mutation";
import { ItemValues, Price } from "./types";

export function remove<T>(key: string | number) {
  return (prev: { [key: string]: T }) => {
    const { ...rest } = prev;
    delete rest[key];
    return rest;
  };
}
export const makeImageUrl = (
  pathOrUrl: string,
  size = "--pdp_main-640.jpg",
) => {
  if (pathOrUrl.startsWith("http")) {
    return pathOrUrl;
  }
  return "https://www.elgiganten.se" + pathOrUrl?.replace(".jpg", size);
};

export const useFetchMutation = <T, U>(
  key: string,
  fn: (payload: U) => Promise<T>,
  config?: SWRMutationConfiguration<T, Error, string, U>,
) => {
  return useSWRMutation(key, (_, { arg }) => fn(arg), {
    ...config,
    populateCache: true,
  });
};

export const getPrice = (values: ItemValues): Price => {
  const current = Number(values["4"]);
  const original = values["5"] != null ? Number(values["5"]) : null;
  const discount = values["8"] != null ? Number(values["8"]) : null;

  if (original != null && original > current) {
    return {
      isDiscounted: true,
      current,
      original,
      discount: discount ?? original - current,
    };
  }
  return {
    isDiscounted: false,
    current: Number(current ?? 0),
  };
};
