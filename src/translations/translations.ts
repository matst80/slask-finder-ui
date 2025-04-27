import { BaseTranslationType } from "../lib/types";

export const swedish = {
  common: {
    copied: "{{content}} kopierad till urklipp",
    copied_title: "Kopierad till urklipp",
    add: "Lägg till",
    remove: "Radera",
    clear: "Töm",
    cancel: "Cancel",
    ok: "OK",
    yes: "Ja",
    no: "Nej",
    loading: "Laddar...",
    error: {
      generic: "Ett fel uppstod. Försök igen senare.",
      not_found: "Här var det tomt.",
      // Add more error messages as needed
    },
  },
  facets: {
    title: "Filter",
    stock: "Butikslager",
    gotoResults: "Till resulten",
    stockEmptySelection: "Välj butik",
  },
  result: {
    header: "Resultat ({{ hits }})",
    back: "Gå till förra sökningen",
    copy: "Kopiera länk",
  },
  cart: {
    title: "Varukorg",
    empty: "Din kundvagn är tom",
    add: "Lägg i kundvagn",
    remove: "Ta bort",
    checkout: "Till kassan",
    total: "Totalt",
    totalItems: "Antal artiklar",
  },
} satisfies BaseTranslationType;

export type Translations = typeof swedish;
