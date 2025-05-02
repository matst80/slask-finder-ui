import { PropsWithChildren, useCallback, useEffect, useRef } from "react";
import { trackImpression } from "../datalayer/beacons";
import { ImpressionContext } from "./ImpressionContext";
import { useTracking } from "./TrackingContext";
import { BaseEcomEvent } from "../types";

export const ImpressionProvider = ({ children }: PropsWithChildren) => {
  const { track } = useTracking();
  const observer = useRef<IntersectionObserver | null>(null);
  const watched = useRef<Map<HTMLElement, BaseEcomEvent>>(new Map());

  const watch = useCallback(
    (data: BaseEcomEvent) => (ref: HTMLElement | null) => {
      if (ref != null && observer.current) {
        requestAnimationFrame(() => {
          observer.current?.observe(ref);
          watched.current.set(ref, data);
          // ref.dataset.id = String(data.id);
          // ref.dataset.position = String(data.position);
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
          watched.current.delete(ref);
        });
      }
    },
    [observer]
  );
  useEffect(() => {
    //const impressions = new Set<number>();
    let toPush: BaseEcomEvent[] = [];
    const observerInstance = new IntersectionObserver(
      (entries) => {
        entries
          .filter((d) => d.isIntersecting)
          .forEach((entry) => {
            const target = entry.target as HTMLElement;
            const impression = watched.current.get(target);

            if (impression != null) {
              toPush.push({ ...impression });

              watched.current.delete(target);
            }
          });
      },
      { threshold: 1 }
    );
    const pushImpressions = () => {
      if (toPush.length) {
        //trackImpression(toPush);
        track({ type: "impressions", items: toPush });
        toPush = [];
      }
    };
    const interval = setInterval(pushImpressions, 1000);
    observer.current = observerInstance;
    return () => {
      clearInterval(interval);
      observerInstance.disconnect();
    };
  }, [track]);
  return (
    <ImpressionContext.Provider
      value={{ watch, unwatch, observer: observer.current }}
    >
      {children}
    </ImpressionContext.Provider>
  );
};
