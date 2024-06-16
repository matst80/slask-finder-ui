import "./App.css";
import { AutoSuggest } from "./components/autosuggest";
import { SearchContextProvider } from "./SearchContext";

function App() {
  return (
    <SearchContextProvider pageSize={25}>
      <div>
        <AutoSuggest />
      </div>
    </SearchContextProvider>
  );
}

export default App;
