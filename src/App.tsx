import { AutoSuggest } from "./components/AutoSuggest";
import { CurrentFilters } from "./components/CurrentFilters";
import { Facets } from "./components/Facets";
import { MiniCart } from "./components/MiniCart";
import { Paging } from "./components/Paging";
import { SearchResultList } from "./components/SearchResultList";
import { Sorting } from "./components/Sorting";
import { SelectedStore } from "./components/StoreSelector";
import {
  PopularityContextProvider,
  SearchContextProvider,
} from "./SearchContext";

function App() {
  return (
    <SearchContextProvider pageSize={40}>
      <PopularityContextProvider>
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

              <header className="flex justify-between gap-2 items-center mb-6">
                <h1 className="md:text-2xl font-bold">Produkter</h1>
                <SelectedStore />
                <div className="relative">
                  <Sorting />
                </div>
              </header>

              <SearchResultList />

              <Paging />
            </main>
          </div>
        </div>
      </PopularityContextProvider>
    </SearchContextProvider>
  );
}

export default App;
