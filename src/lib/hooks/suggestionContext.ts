import { createContext } from "react";

import { Suggestion, Item, ItemsQuery } from "../types";
import {
  ConvertedFacet,
  FlatFacetValue,
  SuggestQuery,
} from "./suggestionUtils";

type SuggestionProviderType = {
  suggestions: Suggestion[];
  items: Item[];
  facets: ConvertedFacet[];
  setValue: React.Dispatch<React.SetStateAction<string | null>>;
  popularQueries: SuggestQuery[] | null;
  value: string | null;
  hasSuggestions: boolean;
  possibleTriggers:
    | {
        word: string;
        result: Fuzzysort.KeysResults<FlatFacetValue>;
      }[]
    | null;
  smartQuery: ItemsQuery | null;
};

export const SuggestionContext = createContext<SuggestionProviderType | null>(
  null
);
