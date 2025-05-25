"use client";
import { useContext } from "react";
import { BuilderContext } from "./builder-context";

export const useBuilderContext = () => {
  const context = useContext(BuilderContext);
  if (context == null) {
    throw new Error("useBuilderContext must be used within a BuilderContext");
  }
  return context;
};
