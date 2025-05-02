import {
  GoogleTracker,
  GoogleTrackingContext,
} from "../lib/hooks/TrackingContext";

type WindowWithDataLayer = Window & {
  dataLayer?: unknown[];
};

export const googleTracker = (
  context?: GoogleTrackingContext
): GoogleTracker => {
  return {
    type: "google",
    context: context || {},
    track: (event, context) => {
      const w = globalThis?.window as WindowWithDataLayer;
      console.log("google tracker", { event, context, dataLayer: w.dataLayer });
      if (w?.dataLayer) {
        w?.dataLayer.push(event);
      }
    },
  };
};
