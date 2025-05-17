import useSWR from "swr";
import {
  getRawData,
  getTrackingPopularity,
  getTrackingQueries,
  getTrackingSessions,
} from "../lib/datalayer/api";

export const useSessions = () => {
  return useSWR("/tracking/sessions", getTrackingSessions);
};

export const useSearchQueries = () => {
  return useSWR("/tracking/queries", getTrackingQueries);
};

export const useTrackingPopularity = () => {
  return useSWR("/tracking/popularity", getTrackingPopularity);
};

export const useItemData = (id: number) => {
  return useSWR(`/api/item/${id}`, () => getRawData(String(id)), {
    refreshInterval: 0,
    keepPreviousData: true,
    revalidateOnFocus: false,
  });
};
