import "./App.css";
import { AutoSuggest } from "./components/AutoSuggest";
import { Paging } from "./components/Paging";
import { SearchResultList } from "./components/SearchResultList";
import { SearchContextProvider } from "./SearchContext";

function App() {
  return (
    <SearchContextProvider pageSize={25}>
      <div>
        <AutoSuggest />
      </div>
      <div>
        <div></div>
        <div>
          <SearchResultList />
        </div>
        <Paging />
      </div>
    </SearchContextProvider>
  );
}

export default App;
