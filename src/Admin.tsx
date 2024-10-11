import { Link, Outlet } from "react-router-dom";
import { AutoSuggest } from "./components/AutoSuggest";
import { CurrentFilters } from "./components/CurrentFilters";
import { Facets } from "./components/Facets";
import { Paging } from "./components/Paging";
import { ResultHeader } from "./components/ResultHeader";
import {
  AllFacets,
  TableSearchResultList,
} from "./components/SearchResultList";

const AdminNavBar = () => {
  return (
    <nav className="bg-white shadow-md border-t border-gray-300">
      <div className="mx-auto sm:px-6 lg:px-4">
        <div className="flex items-center justify-between h-12">
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-4">
              <Link
                to="/edit/facets"
                className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                Facets
              </Link>
              <Link
                to="/edit/bulk"
                className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                Overview
              </Link>

              {/* <Link
                  to="/stats"
                  className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Tracking
                </Link>
                <Link
                  to="/edit"
                  className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Edit
                </Link> */}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export const Admin = () => {
  return (
    <>
      <AdminNavBar />
      <div className="px-10 py-2 bg-gray-100 min-h-screen">
        <Outlet />
      </div>
    </>
  );
};

export const EditFacetsView = () => {
  return <AllFacets />;
};

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
