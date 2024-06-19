import "./App.css";
import { AutoSuggest } from "./components/AutoSuggest";
import { Facets } from "./components/Facets";
import { Paging } from "./components/Paging";
import { SearchResultList } from "./components/SearchResultList";
import { SearchContextProvider } from "./SearchContext";

function App() {
  return (
    <SearchContextProvider pageSize={25}>
      <div>
        <AutoSuggest />
      </div>
      <div className="results">
        <div className="sidebar">
          <Facets />
        </div>
        <div className="flex-1">
          <SearchResultList />
          <Paging />
        </div>
      </div>
    </SearchContextProvider>
  );
}

export default App;
