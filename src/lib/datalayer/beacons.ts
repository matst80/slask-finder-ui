import { BaseEcomEvent } from "../types";

const toTrackingEvent = ({ item_id, ...rest }: BaseEcomEvent) => ({
  ...rest,
  id: Number(item_id),
});

export const trackClick = (data: BaseEcomEvent) =>
  globalThis.navigator.sendBeacon(
    `/track/click`,
    JSON.stringify(toTrackingEvent(data))
  );

export const trackImpression = (impressions: BaseEcomEvent[]) =>
  globalThis.navigator.sendBeacon(
    `/track/impressions`,
    JSON.stringify(impressions.map(toTrackingEvent))
  );

export const trackAction = (payload: {
  item?: BaseEcomEvent;
  action: string;
  reason: string;
}) => globalThis.navigator.sendBeacon(`/track/action`, JSON.stringify(payload));

export const trackSuggest = (payload: {
  value: string;
  results: number;
  suggestions: number;
}) =>
  globalThis.navigator.sendBeacon(`/track/suggest`, JSON.stringify(payload));

export const trackCart = (
  payload: BaseEcomEvent & {
    type: "add" | "quantity" | "remove";
  }
) => globalThis.navigator.sendBeacon(`/track/cart`, JSON.stringify(payload));

export const trackEnterCheckout = (data: { items: BaseEcomEvent[] }) =>
  globalThis.navigator.sendBeacon(
    `/track/enter-checkout`,
    JSON.stringify(data)
  );
