export const trackClick = (id: string, position: number) =>
  globalThis.navigator.sendBeacon(`/api/track/click?id=${id}&pos=${position}`);

export type Impression = { id: string; position: number };

export const trackImpression = (impressions: Impression[]) =>
  globalThis.navigator.sendBeacon(
    `/api/track/impressions`,
    JSON.stringify([...impressions])
  );
