import React, { createContext, PropsWithChildren } from "react";

export type TrackingEvent = ImpressionEvent | ClickEvent;

type ImpressionEvent = {
  type: "impression";
  id: number;
  position: number;
};

type ClickEvent = {
  type: "click";
  id: number;
  position: number;
};

export type TrackingHandler = {
  type: string;
  [key: string]: unknown;
  track: (event: TrackingEvent) => void;
};

type TrackingContextProps = {
  handlers: TrackingHandler[];
  setHandlers: React.Dispatch<React.SetStateAction<TrackingHandler[]>>;
};

const TrackingContext = createContext<TrackingContextProps | null>(null);

export const TrackingProvider = ({
  handlers: initialHandlers,
  children,
}: PropsWithChildren<{ handlers: TrackingHandler[] }>) => {
  const context = React.useContext(TrackingContext);
  const all = [...initialHandlers, ...(context?.handlers || [])];
  console.log("all handlers", all);
  const [handlers, setHandlers] = React.useState<TrackingHandler[]>(all);

  return (
    <TrackingContext.Provider value={{ handlers, setHandlers }}>
      {children}
    </TrackingContext.Provider>
  );
};

export const useTrackingHandlers = () => {
  const context = React.useContext(TrackingContext);
  if (!context) {
    throw new Error(
      "useTrackingHandlers must be used within a TrackingProvider"
    );
  }
  return context.handlers;
};

export const useTracking = () => {
  const context = React.useContext(TrackingContext);
  if (!context) {
    throw new Error("useTracking must be used within a TrackingProvider");
  }
  return {
    track: (event: TrackingEvent) => {
      context.handlers.forEach((handler) => {
        handler.track.apply(handler, [event]);
      });
    },
  };
};
