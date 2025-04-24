export const trackClick = (id: string | number, position: number) =>
  globalThis.navigator.sendBeacon(`/track/click?id=${id}&pos=${position}`);

export type Impression = { id: number; position: number };

export const trackImpression = (impressions: Impression[]) =>
  globalThis.navigator.sendBeacon(
    `/track/impressions`,
    JSON.stringify([...impressions])
  );

export const trackAction = (payload: {
  item?: number;
  action: string;
  reason: string;
}) => globalThis.navigator.sendBeacon(`/track/action`, JSON.stringify(payload));

export const trackSuggest = (payload: {
  value: string;
  results: number;
  suggestions: number;
}) =>
  globalThis.navigator.sendBeacon(`/track/suggest`, JSON.stringify(payload));

export const trackCart = (payload: {
  item: number;
  quantity: number;
  type: "add" | "quantity" | "remove";
}) => globalThis.navigator.sendBeacon(`/track/cart`, JSON.stringify(payload));

export const trackEnterCheckout = (data: {
  items: { item: number; quantity: number }[];
}) =>
  globalThis.navigator.sendBeacon(
    `/track/enter-checkout`,
    JSON.stringify(data)
  );
