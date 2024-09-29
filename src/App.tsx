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

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function App() {
  return (
    <SearchContextProvider pageSize={40}>
      <PopularityContextProvider>
        <DndProvider backend={HTML5Backend}>
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
                  <MiniCart />
                </header>

                <SearchResultList />

                <Paging />
              </main>
            </div>
          </div>
        </DndProvider>
      </PopularityContextProvider>
    </SearchContextProvider>
  );
}

export default App;
