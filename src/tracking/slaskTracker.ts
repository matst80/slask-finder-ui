import { SlaskTracker } from "../lib/hooks/TrackingContext";

export const slaskTracker = (): SlaskTracker => {
  return {
    type: "slask",
    context: {},
    track: (event, context) => {
      console.log("slask tracker", { event });
    },
  };
};
