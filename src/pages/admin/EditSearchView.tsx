import { AutoSuggest } from "../../components/AutoSuggest";
import { CurrentFilters } from "../../components/CurrentFilters";
import { Facets } from "../../components/Facets";
import { Paging } from "../../components/Paging";
import { ResultHeader } from "../../components/ResultHeader";
import { TableSearchResultList } from "./TableSearchResultList";

export const EditSearchView = () => {
  return (
    <>
      <div className="flex gap-2 items-center mb-2 py-2 rounded-b-md relative">
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
    </>
  );
};
