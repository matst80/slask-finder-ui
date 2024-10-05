import { useKeyboardAdminToggle } from "./appState";
import { AutoSuggest } from "./components/AutoSuggest";
import { CurrentFilters } from "./components/CurrentFilters";
import { Facets } from "./components/Facets";
import { ItemDetails } from "./components/ItemDetails";
import { MiniCart } from "./components/MiniCart";
import { Paging } from "./components/Paging";
import { ResultHeader } from "./components/ResultHeader";
import { SearchResultList } from "./components/SearchResultList";

function App() {
  useKeyboardAdminToggle();
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-2 items-center mb-6 sticky top-0 z-10 bg-white py-2 rounded-b-md">
        <AutoSuggest />
        <MiniCart />
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <Facets />

        <main className="flex-1">
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
