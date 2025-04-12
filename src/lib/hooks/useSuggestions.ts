import { useContext } from "react";
import { SuggestionContext } from "./suggestionContext";

export const useSuggestions = () => {
  const ctx = useContext(SuggestionContext);
  if (!ctx) {
    throw new Error("useSuggestions must be used within a SuggestionProvider");
  }
  return ctx;
};
