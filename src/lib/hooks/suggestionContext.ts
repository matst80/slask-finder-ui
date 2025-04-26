import { createContext } from "react";

import { Suggestion, Item, ItemsQuery, ContentRecord } from "../types";
import {
  ConvertedFacet,
  FlatFacetValue,
  SuggestQuery,
} from "./suggestionUtils";

type SuggestionProviderType = {
  suggestions: Suggestion[];
  items: SuggestResultItem[];
  //facets: ConvertedFacet[];
  //content?: ContentRecord[];
  setValue: React.Dispatch<React.SetStateAction<string | null>>;
  //popularQueries: SuggestQuery[] | null;
  value: string | null;
  //hasSuggestions: boolean;
  possibleTriggers: QuickTrigger[] | null;
  smartQuery: ItemsQuery | null;
};

export type QuickTrigger = {
  word: string;
  result: Fuzzysort.KeysResults<FlatFacetValue>;
};

export type SuggestResultItem =
  | SuggestedProduct
  | SuggestQuery
  | SuggestedContent
  | QueryRefinement;

export type ResultItemType = SuggestResultItem["type"];

export type QueryRefinement = {
  type: "refinement";
  facetId: number;
  facetName: string;
  values: {
    value: string;
    hits: number;
  }[];
  flat: boolean;
  query?: string;
};

type BaseConfig = { type: "product" | "query" | "content"; maxAmount: number };

type RefinementConfig = {
  type: "refinement";
  maxAmount: number;
  facetConfig: Record<number, { flat: boolean; maxHits: number }>;
};

export type SuggestionConfig = (BaseConfig | RefinementConfig)[];

export type SuggestedContent = ContentRecord & { type: "content" };

export type SuggestedProduct = Item & { type: "product" };

export const SuggestionContext = createContext<SuggestionProviderType | null>(
  null
);
