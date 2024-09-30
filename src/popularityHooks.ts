import useSWR from "swr";
import { getPopularity, updatePopularity } from "./api";
import { useFetchMutation } from "./utils";

const popularityKey = "/popular-items";

export const useItemsPopularity = () => {
  return useSWR(popularityKey, getPopularity, {});
};

export const useUpdatePopularity = () => {
  return useFetchMutation(popularityKey, updatePopularity);
};
