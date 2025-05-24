"use client";
import { createContext } from "react";
import { Translations } from "../../translations/translations";

export const translationContext = createContext<Translations | null>(null);
