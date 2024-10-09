export const trackClick = (id: string, position: number) =>
  globalThis.navigator.sendBeacon(`/api/track/click?id=${id}&pos=${position}`);

export const trackImpression = (id: string, position: number) =>
  globalThis.navigator.sendBeacon(
    `/api/track/impression?id=${id}&pos=${position}`
  );
