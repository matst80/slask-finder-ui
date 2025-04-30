import { useFocusTracking } from "../hooks/appState";
import { AutoSuggest } from "../components/AutoSuggest";
import { CurrentFilters } from "../components/CurrentFilters";
import { ResultHeader } from "../components/ResultHeader";
import { SearchResultList } from "../components/SearchResultList";
import { Facets } from "../components/Facets";
import { SuggestionProvider } from "../lib/hooks/SuggestionProvider";
import { Sidebar } from "../components/ui/sidebar";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Menu } from "lucide-react";

// px-4 py-3 md:py-8 md:px-10
// px-4 md:px-10

function App() {
  useFocusTracking();
  const [open, setOpen] = useState(false);
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
        <div className="max-w-[1920px] mx-auto md:relative">
          <AutoSuggest />
        </div>
      </div>
      <div className="max-w-[1920px] mx-auto">
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
      <Sidebar open={open} setOpen={setOpen}>
        <div className="flex flex-col justify-between gap-2">
          <span>test content</span>
          <Button
            className="absolute right-3 bottom-3"
            onClick={() => setOpen(false)}
          >
            Ok
          </Button>
        </div>
      </Sidebar>
      <button
        className="fixed right-5 bottom-5 bg bg-gray-50 p-2 border rounded-md z-50 border-gray-100 hover:border-gray-300 hover:bg-gray-100 transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <Menu className="size-5" />
        <span className="sr-only">Open sidebar</span>
      </button>
      <div className="progress z-40" />
    </SuggestionProvider>
  );
}

export default App;
