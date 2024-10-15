import useSWR from "swr";
import {
  getRawData,
  getTrackingPopularity,
  getTrackingQueries,
  getTrackingSessions,
} from "../datalayer/api";

export const useSessions = () => {
  return useSWR("/api/sessions", getTrackingSessions);
};

export const useSearchQueries = () => {
  return useSWR("/api/queries", getTrackingQueries);
};

export const useTrackingPopularity = () => {
  return useSWR("/api/popularity", getTrackingPopularity);
};

export const useItemData = (id: number) => {
  return useSWR(`/api/item/${id}`, () => getRawData(String(id)), {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });
};
