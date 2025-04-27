import { BaseTranslationType } from "../lib/types";

export const translations = {
  common: {
    add: "Add",
    remove: "Remove",
    clear: "Clear",
    apply: "Apply",
    cancel: "Cancel",
    ok: "OK",
    yes: "Yes",
    no: "No",
    loading: "Loading...",
    error: {
      generic: "An error occurred. Please try again.",
      not_found: "Not found.",
      // Add more error messages as needed
    },
  },
  facets: {
    title: "Filter",
    stock: "Butikslager",
    gotoResults: "Till resulten",
  },
  // Add more translations as needed

  // Add more languages as needed
} satisfies BaseTranslationType;

export type Translations = typeof translations;
