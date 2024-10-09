export const trackClick = (id: string, position: number) =>
  globalThis.navigator.sendBeacon(`/api/track/click?id=${id}&pos=${position}`);

export type Impression = { id: number; position: number };

export const trackImpression = (impressions: Impression[]) =>
  globalThis.navigator.sendBeacon(
    `/api/track/impressions`,
    JSON.stringify([...impressions])
  );

export const trackAction = (payload: { action: string; reason: string }) =>
  globalThis.navigator.sendBeacon(`/api/track/action`, JSON.stringify(payload));
