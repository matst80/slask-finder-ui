import useSWR from "swr";
import {
  getTrackingPopularity,
  getTrackingQueries,
  getTrackingSessions,
} from "./api";

export const useSessions = () => {
  return useSWR("/api/sessions", getTrackingSessions);
};

export const useSearchQueries = () => {
  return useSWR("/api/queries", getTrackingQueries);
};

export const useTrackingPopularity = () => {
  return useSWR("/api/popularity", getTrackingPopularity);
};
