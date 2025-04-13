import fuzzysort from "fuzzysort";
import { useState, useEffect, useMemo, PropsWithChildren } from "react";
import { useFacetMap } from "../../hooks/searchHooks";

import {
  getPopularQueries,
  autoSuggestResponse,
  handleSuggestResponse,
  SuggestionResponse,
  getContentResults,
} from "../datalayer/api";
import { trackSuggest } from "../datalayer/beacons";
import { ContentRecord, ItemsQuery } from "../types";
import {
  convertPopularQueries,
  FlatFacetValue,
  SuggestQuery,
} from "./suggestionUtils";
import { SuggestionContext } from "./suggestionContext";

const MIN_SCORE = 0.9;

type Options = {
  includeContent?: boolean;
};

export const SuggestionProvider = ({
  children,
  includeContent,
}: PropsWithChildren<Options>) => {
  const { data: facetData } = useFacetMap();
  const [contentResults, setContentResults] = useState<
    ContentRecord[] | undefined
  >(undefined);
  const [value, setValue] = useState<string | null>(null);
  const [popularQueries, setPopularQueries] = useState<SuggestQuery[]>([]);

  const [data, setData] = useState<SuggestionResponse>({
    facets: [],
    items: [],
    suggestions: [],
  });
  const [smartQuery, setSmartQuery] = useState<ItemsQuery | null>(null);
  const [possibleTriggers, setPossibleTriggers] = useState<
    | {
        word: string;
        result: Fuzzysort.KeysResults<FlatFacetValue>;
      }[]
    | null
  >(null);

  const { suggestions, items, facets } = data;

  useEffect(() => {
    if (facetData == null) {
      return;
    }
    getPopularQueries(value ?? "")
      .then(convertPopularQueries(facetData))
      .then(setPopularQueries);
  }, [value, facetData]);

  const parts = useMemo(() => {
    if (value == null) {
      return new Set<string>();
    }
    const words = value.toLocaleLowerCase().split(" ");
    const lastWord = words.pop();
    if (lastWord == null) {
      return new Set<string>();
    }
    return new Set(words.concat(lastWord));
  }, [value]);

  useEffect(() => {
    if (facets == null || facets.length === 0) {
      return;
    }
    const wordResults = Array.from(parts).map((word) => {
      const result = fuzzysort.go(
        word,
        facets.flatMap(({ values, ...rest }) =>
          values.map(
            ({ value, hits }): FlatFacetValue => ({ ...rest, value, hits })
          )
        ) ?? [],
        {
          keys: ["value"],
          limit: 10,
          threshold: -100,
        }
      );

      //console.log("reslt total", word, result.total);
      return { word, result };
    });

    const words = new Set(parts);

    const newQuery: ItemsQuery = {
      string: [],
      range: [],
    };

    wordResults.forEach(({ word, result }) => {
      const [best] = result;
      if (best != null && best.score > MIN_SCORE) {
        words.delete(word);
        newQuery.string = [
          ...(newQuery.string?.filter((d) => d.id !== best.obj.id) ?? []),
          {
            id: best.obj.id,
            value: [
              ...(newQuery.string?.find((d) => d.id === best.obj.id)?.value ??
                []),
              best.obj.value,
            ],
          },
        ];
      }
    });

    newQuery.query = words.size > 0 ? Array.from(words).join(" ") : undefined;
    const validTriggers = wordResults.filter(({ result }) => result.length > 0);
    if (validTriggers.length === 0) {
      setSmartQuery(null);
      setPossibleTriggers(null);
      return;
    } else {
      setSmartQuery(newQuery);
      setPossibleTriggers(validTriggers);
    }
    //return [wordResults, newQuery];
  }, [parts, facets]);

  useEffect(() => {
    if (value == null || !includeContent) {
      return;
    }
    getContentResults(value).then((d) => setContentResults(d.splice(0, 10)));
  }, [value, includeContent]);

  useEffect(() => {
    if (value == null) {
      return;
    }
    const { cancel, promise } = autoSuggestResponse(value);

    promise.then(handleSuggestResponse).then((state) => {
      setData(state);
      trackSuggest({
        items: state.items.length,
        suggestions: state.suggestions.length,
        value,
      });
    });
    return cancel;
  }, [value]);

  const hasSuggestions = useMemo(
    () =>
      items.length > 0 ||
      facets.length > 0 ||
      suggestions.length > 0 ||
      (contentResults != null && contentResults.length > 0) ||
      (popularQueries != null && Object.keys(popularQueries).length > 0),
    [items, facets, suggestions, popularQueries, contentResults]
  );

  return (
    <SuggestionContext.Provider
      value={{
        suggestions,
        items,
        facets,
        content: contentResults,
        setValue,
        popularQueries,
        hasSuggestions,
        value,
        possibleTriggers,
        smartQuery,
      }}
    >
      {children}
    </SuggestionContext.Provider>
  );
};
