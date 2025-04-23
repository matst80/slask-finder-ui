import { PropsWithChildren, useCallback, useEffect, useRef } from "react";
import { Impression, trackImpression } from "../datalayer/beacons";
import { ImpressionContext } from "./ImpressionContext";

export const ImpressionProvider = ({ children }: PropsWithChildren) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const watch = useCallback(
    (data: Impression) => (ref: HTMLElement | null) => {
      if (ref != null && observer.current) {
        requestAnimationFrame(() => {
          observer.current?.observe(ref);
          ref.dataset.id = String(data.id);
          ref.dataset.position = String(data.position);
        });
      }
    },
    [observer]
  );
  const unwatch = useCallback(
    (ref: HTMLElement) => {
      if (ref != null && observer.current) {
        requestAnimationFrame(() => {
          observer.current?.unobserve(ref);
          delete ref.dataset.id;
          delete ref.dataset.position;
        });
      }
    },
    [observer]
  );
  useEffect(() => {
    const impressions = new Set<number>();
    let toPush: Impression[] = [];
    const observerInstance = new IntersectionObserver(
      (entries) => {
        entries
          .filter((d) => d.isIntersecting)
          .forEach((entry) => {
            const target = entry.target as HTMLElement;
            const id = Number(target.dataset.id);
            const position = Number(target.dataset.position);
            if (id != null && !isNaN(position)) {
              if (!impressions.has(id)) {
                toPush.push({ id, position });
                impressions.add(id);
              }
            }
          });
      },
      { threshold: 1 }
    );
    const pushImpressions = () => {
      if (toPush.length) {
        trackImpression(toPush);
        toPush = [];
      }
    };
    const interval = setInterval(pushImpressions, 1000);
    observer.current = observerInstance;
    return () => {
      clearInterval(interval);
      observerInstance.disconnect();
    };
  }, []);
  return (
    <ImpressionContext.Provider
      value={{ watch, unwatch, observer: observer.current }}
    >
      {children}
    </ImpressionContext.Provider>
  );
};
