import { AutoSuggest } from "./components/AutoSuggest";
import { CurrentFilters } from "./components/CurrentFilters";
import { Facets } from "./components/Facets";
import { Paging } from "./components/Paging";
import { ResultHeader } from "./components/ResultHeader";
import { TableSearchResultList } from "./components/SearchResultList";

export const Admin = () => {
  return (
    <div className="px-10 py-2 bg-gray-100">
      <div className="flex gap-2 items-center mb-2 py-2 rounded-b-md">
        <AutoSuggest />
        {/* <MiniCart /> */}
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <Facets />

        <main className="flex-1">
          <CurrentFilters />
          <ResultHeader />
          <TableSearchResultList />
          <Paging />
        </main>
      </div>
    </div>
  );
};
