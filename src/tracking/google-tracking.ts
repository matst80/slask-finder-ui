import {
  GoogleTracker,
  GoogleTrackingContext,
} from "../lib/hooks/TrackingContext";

type WindowWithDataLayer = Window & {
  gtag?: (event: "event" | "config", ...args: any[]) => void;
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
      console.log("google tracker", { event, context, dataLayer: w.gtag });
      if (w?.gtag) {
        switch (event.type) {
          case "impressions":
            w.gtag("event", "view_item_list", {
              ...context,
              items: event.items.map((item) => ({
                item_name: item.name,
                item_id: item.id,
                item_brand: item.brand,
                price: item.price,
                index: item.position,
                currency: "SEK",
                ...(item.category
                  ? Object.fromEntries(
                      item.category.map(
                        (value, level) =>
                          [`item_category_${level + 1}`, value] as [
                            string,
                            string
                          ]
                      )
                    )
                  : {}),
              })),
            });
            break;
        }
      }
    },
  };
};
