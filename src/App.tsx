import { AutoSuggest } from "./components/AutoSuggest";
import { CurrentFilters } from "./components/CurrentFilters";
import { Facets } from "./components/Facets";
import { ItemDetails } from "./components/ItemDetails";
import { MiniCart } from "./components/MiniCart";
import { Paging } from "./components/Paging";
import { ResultHeader } from "./components/ResultHeader";
import { SearchResultList } from "./components/SearchResultList";

function App() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-72">
          <h2 className="text-lg font-semibold mb-4">Filter</h2>
          <Facets />
        </aside>

        <main className="flex-1">
          <div className="flex gap-2 items-center mb-6 sticky top-0 z-10 bg-white p-2">
            <AutoSuggest />
            <MiniCart />
          </div>

          <CurrentFilters />

          <ResultHeader />

          <SearchResultList />

          <Paging />
        </main>
      </div>
      <ItemDetails />
    </div>
  );
}

export default App;
