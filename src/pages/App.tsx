import { useFocusTracking } from "../hooks/appState";
import { AutoSuggest } from "../components/AutoSuggest";
import { CurrentFilters } from "../components/CurrentFilters";
import { ResultHeader } from "../components/ResultHeader";
import { SearchResultList } from "../components/SearchResultList";
import { Facets } from "../components/Facets";
import { SuggestionProvider } from "../lib/hooks/SuggestionProvider";

// px-4 py-3 md:py-8 md:px-10
// px-4 md:px-10

function App() {
  useFocusTracking();

  return (
    <SuggestionProvider
      config={[
        { type: "query", maxAmount: 5 },
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
        //{ type: "content", maxAmount: 5 },
      ]}
    >
      <div className="gap-2 md:my-8 border-b md:border-0 border-gray-300 md:mb-6 scroll-sticky-top z-30 py-2 max-h-screen">
        <div className="max-w-[1920px] mx-auto md:relative md:mx-6">
          <AutoSuggest />
        </div>
      </div>
      <div className="max-w-[1920px] mx-auto md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-[288px_auto]">
          <div className="border-b-1 py-1 px-4 md:px-0 md:py-0 border-gray-300 md:border-none bg-gray-50 md:bg-white">
            <Facets />
          </div>
          <main className="container px-4 md:px-10">
            <CurrentFilters />
            <ResultHeader />
            <SearchResultList />
            {/* <Paging /> */}
          </main>
        </div>
      </div>

      <div className="progress z-40" />
    </SuggestionProvider>
  );
}

export default App;
