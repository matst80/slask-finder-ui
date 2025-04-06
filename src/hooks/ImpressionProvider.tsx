import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Impression, trackImpression } from "../datalayer/beacons";

type ImpressionContextProps = {
  watch: (ref: HTMLElement, data: Impression) => void;
};
const ImpressionContext = createContext<ImpressionContextProps | null>(null);

export const ImpressionProvider = ({ children }: PropsWithChildren) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const watch = useCallback(
    (ref: HTMLElement, data: Impression) => {
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
        if (toPush.length) {
          trackImpression(toPush);
          toPush = [];
        }
      },
      { threshold: 1 }
    );
    observer.current = observerInstance;
    return () => {
      observerInstance.disconnect();
    };
  }, []);
  return (
    <ImpressionContext.Provider value={{ watch }}>
      {children}
    </ImpressionContext.Provider>
  );
};

export const useImpression = () => {
  const context = useContext(ImpressionContext);
  if (context == null) {
    throw new Error("useImpression must be used within an ImpressionProvider");
  }
  return context;
};
