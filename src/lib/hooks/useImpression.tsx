import { useContext } from "react";
import { ImpressionContext } from "./ImpressionContext";

export const useImpression = () => {
  const context = useContext(ImpressionContext);
  if (context == null) {
    throw new Error("useImpression must be used within an ImpressionProvider");
  }
  return context;
};
