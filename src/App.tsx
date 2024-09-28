import { AutoSuggest } from "./components/AutoSuggest";
import { CurrentFilters } from "./components/CurrentFilters";
import { Facets } from "./components/Facets";
import { Paging } from "./components/Paging";
import { SearchResultList } from "./components/SearchResultList";
import { Sorting } from "./components/Sorting";
import { SelectedStore } from "./components/StoreSelector";
import { SearchContextProvider } from "./SearchContext";

function App() {
  return (
    <SearchContextProvider pageSize={40}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-72">
            <h2 className="text-lg font-semibold mb-4">Filter</h2>
            <Facets />
          </aside>

          <main className="flex-1">
            <AutoSuggest />

            <CurrentFilters />

            <header className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Produkter</h1>
              <SelectedStore />
              <div className="relative">
                <Sorting />
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <SearchResultList />
            </div>
            <Paging />
          </main>
        </div>
      </div>
    </SearchContextProvider>
  );
}

export default App;
