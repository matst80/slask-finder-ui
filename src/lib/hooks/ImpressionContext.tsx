import { createContext } from "react";
import { Impression } from "../datalayer/beacons";

type ImpressionContextProps = {
  watch: (data: Impression) => (ref: HTMLElement | null) => void;
  unwatch: (ref: HTMLElement) => void;
  observer: IntersectionObserver | null;
};
export const ImpressionContext = createContext<ImpressionContextProps | null>(
  null
);
