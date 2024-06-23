import "./App.css";
import { AutoSuggest } from "./components/AutoSuggest";
import { Facets } from "./components/Facets";
import { Paging } from "./components/Paging";
import { SearchResultList } from "./components/SearchResultList";
import { SearchContextProvider } from "./SearchContext";

function App() {
  return (
    <SearchContextProvider pageSize={25}>
      <AutoSuggest />

      <input type="checkbox" className="openSidebarMenu" id="openSidebarMenu" />
      <label htmlFor="openSidebarMenu" className="sidebarIconToggle">
        <div className="spinner diagonal part-1"></div>
        <div className="spinner horizontal"></div>
        <div className="spinner diagonal part-2"></div>
      </label>
      <div id="sidebarMenu">
        <Facets />
      </div>
      <div id="center" className="main center">
        <SearchResultList />
        <Paging />
      </div>
    </SearchContextProvider>
  );
}

export default App;
