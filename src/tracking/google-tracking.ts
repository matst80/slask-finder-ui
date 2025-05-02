import { TrackingHandler } from "../lib/hooks/TrackingContext";

type WindowWithDataLayer = Window & {
  dataLayer?: unknown[];
};

export const googleTracker: TrackingHandler = {
  type: "google",
  track: (event) => {
    console.log("Google tracking event:", event);
    const w = globalThis?.window as WindowWithDataLayer;
    if (w?.dataLayer) {
      console.log("Google tracking event:", event);
      w?.dataLayer.push(event);
    }
  },
};
