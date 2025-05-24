"use client";
import useSWR from "swr";
import {
  getKeyFacetPopularValues,
  getPopularity,
  updatePopularity,
} from "../lib/datalayer/api";
import { useFetchMutation } from "../useFetchMutation";

const popularityKey = "/popular-items";

export const useItemsPopularity = () => {
  return useSWR(popularityKey, getPopularity, {});
};

export const useUpdatePopularity = () => {
  return useFetchMutation(popularityKey, updatePopularity);
};

export const useKeyFacetValuePopularity = (facetId?: number | string) => {
  return useSWR(
    facetId != null ? `key-facet-popularity-${facetId}` : null,
    () => getKeyFacetPopularValues(facetId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
      refreshWhenHidden: false,
    }
  );
};
