import "./App.css";
import { AutoSuggest } from "./components/AutoSuggest";
import { Facets } from "./components/Facets";
import { Paging } from "./components/Paging";
import { SearchResultList } from "./components/SearchResultList";
import { Sorting } from "./components/Sorting";
import { SearchContextProvider } from "./SearchContext";

function App() {
  return (
    <SearchContextProvider pageSize={40}>
      <div id="topbar">
        <AutoSuggest />
        <div
          className="only-mobile"
          onClick={() => {
            document.getElementById("sidebarMenu")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "start",
            });
          }}
        >
          <span>Filter</span>
        </div>
        <Sorting />
      </div>
      {/* <input type="checkbox" className="openSidebarMenu" id="openSidebarMenu" />
      <label htmlFor="openSidebarMenu" className="sidebarIconToggle">
        <div className="spinner diagonal part-1"></div>
        <div className="spinner horizontal"></div>
        <div className="spinner diagonal part-2"></div>
      </label> */}
      <div id="cnt">
        <div id="sidebarMenu">
          <Facets />
        </div>
        <div className="main">
          <SearchResultList />
          <Paging />
        </div>
      </div>
    </SearchContextProvider>
  );
}

export default App;
