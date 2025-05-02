import { TrackingHandler } from "../lib/hooks/TrackingContext";

type WindowWithDataLayer = Window & {
  dataLayer?: unknown[];
};

export const googleTracker: TrackingHandler = {
  type: "google",
  track: (event) => {
    const w = globalThis?.window as WindowWithDataLayer;
    if (w?.dataLayer) {
      w?.dataLayer.push(event);
    }
  },
};
