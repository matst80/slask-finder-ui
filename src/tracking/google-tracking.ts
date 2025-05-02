import {
  GoogleTracker,
  GoogleTrackingContext,
} from "../lib/hooks/TrackingContext";

type WindowWithDataLayer = Window & {
  gtag?: (event: "event" | "config", ...args: any[]) => void;
  dataLayer?: unknown[];
};

const getCategories = (category: string[] | undefined) =>
  category
    ? Object.fromEntries(
        category.map(
          (value, level) =>
            [
              level === 0 ? "item_category" : `item_category_${level + 1}`,
              value,
            ] as [string, string]
        )
      )
    : {};

export const googleTracker = (
  context?: GoogleTrackingContext
): GoogleTracker => {
  return {
    type: "google",
    context: context || {},
    track: (event, { list_id, list_name }) => {
      const w = globalThis?.window as WindowWithDataLayer;
      console.log("google tracker", { event, context, dataLayer: w.gtag });
      if (w?.gtag) {
        switch (event.type) {
          case "impressions":
            w.gtag("event", "view_item_list", {
              list_name,
              list_id,
              items: event.items.map(
                ({ name, id, brand, position, category, ...data }) => ({
                  ...data,
                  item_name: name,
                  item_id: String(id),
                  item_brand: brand,
                  index: position,
                  currency: "SEK",
                  ...getCategories(category),
                })
              ),
            });
            break;
        }
      }
    },
  };
};
