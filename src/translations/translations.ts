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
    price: "Pris",
    search: "Sök",
    search_placeholder: "Sök efter produkter",
    loading: "Laddar...",
    recommended: "Rekommenderad",
    error: {
      generic: "Ett fel uppstod. Försök igen senare.",
      not_found: "Här var det tomt.",
    },
    similar: "Liknande produkter",
    show_compatible: "Visa kompatibla",
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
    added_to_cart: "Tillagd i kundvagnen!",
  },
  builder: {
    start: {
      title: "Var vill du börja?",
      boxText: "Börja med",
    },
    overview: "Översikt",
    remove: "Ta bort",
    select: "Välj",
    next: {
      other: "Andra komponenter",
      next: "Nästa ({{ title }})",
    },
    footer: {
      psu: "Min PSU: {{ watt }}w",
      sum: "Summa",
      progress: "{{ count }} komponenter",
      clear: "Börja om",
    },
    summary: {
      title: "Ditt fantasktiska bygge",
      description:
        "Här är en sammanställning av ditt bygge. Du kan alltid gå tillbaka och ändra något.",
      forgotten: "Har du glömt något?",
    },
  },
  product: {
    properties: "Specifikationer",
  },
  stock: {
    level: "Lagerstatus",
    in_stock: "I lager",
    in_stock_online: "I lager online {{ stockLevel }} st",
    nr: "{{ stock }} st",
    distance: "{{ distance }} km",
  },
} satisfies BaseTranslationType;

export type Translations = typeof swedish;
