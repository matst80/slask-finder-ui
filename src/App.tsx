import "./App.css";
import { AutoSuggest } from "./components/AutoSuggest";
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
      </div>
    </SearchContextProvider>
  );
}

export default App;
