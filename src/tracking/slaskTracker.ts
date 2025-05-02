import { trackClick, trackImpression } from "../lib/datalayer/beacons";
import { SlaskTracker } from "../lib/hooks/TrackingContext";

export const slaskTracker = (): SlaskTracker => {
  return {
    type: "slask",
    context: {},
    track: (event) => {
      switch (event.type) {
        case "impressions":
          trackImpression(
            event.items.map((item) => ({
              id: Number(item.item_id),
              position: item.index,
            }))
          );
          break;
        case "click":
          trackClick(event.item.item_id, event.item.index);
          break;
        default:
          console.warn("Unknown event type for Slask Tracker", event);
          break;
      }
    },
  };
};
