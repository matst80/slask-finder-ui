import { AutoSuggest } from "../../components/AutoSuggest";
import { CurrentFilters } from "../../components/CurrentFilters";
import { Facets } from "../../components/Facets";
import { Paging } from "../../components/Paging";
import { ResultHeader } from "../../components/ResultHeader";
import { SuggestionProvider } from "../../lib/hooks/SuggestionProvider";
import { TableSearchResultList } from "./TableSearchResultList";

export const EditSearchView = () => {
  return (
    <SuggestionProvider
      config={[
        //{ type: "query", maxAmount: 5 },
        {
          type: "refinement",
          maxAmount: 10,
          facetConfig: {
            2: { flat: true, maxHits: 2 },
            31158: { flat: false, maxHits: 3 },
            10: { flat: true, maxHits: 2 },
            11: { flat: true, maxHits: 1 },
          },
        },
        { type: "product", maxAmount: 20 },
        { type: "content", maxAmount: 5 },
      ]}
    >
      <div className="flex gap-2 items-center mb-2 py-2 rounded-b-md relative">
        <AutoSuggest />
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <Facets />

        <main className="flex-1">
          <CurrentFilters />
          <ResultHeader />
          <TableSearchResultList />
          <Paging />
        </main>
      </div>
    </SuggestionProvider>
  );
};
