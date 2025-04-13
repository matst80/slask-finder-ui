import { useFocusTracking } from "../hooks/appState";
import { AutoSuggest } from "../components/AutoSuggest";
import { CurrentFilters } from "../components/CurrentFilters";
import { Paging } from "../components/Paging";
import { ResultHeader } from "../components/ResultHeader";
import { SearchResultList } from "../components/SearchResultList";
import { Facets } from "../components/Facets";
import { SuggestionProvider } from "../lib/hooks/SuggestionProvider";

function App() {
  useFocusTracking();
  return (
    <SuggestionProvider includeContent={true}>
      <div className="px-4 py-3 md:py-8 md:px-10">
        <div className="flex gap-2 items-center md:mb-6 sticky top-0 z-10 bg-white py-2 rounded-b-md">
          <AutoSuggest />
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <Facets />

          <main className="flex-1 container">
            <CurrentFilters />
            <ResultHeader />
            <SearchResultList />
            <Paging />
          </main>
        </div>
      </div>
    </SuggestionProvider>
  );
}

export default App;
