import { Link, Outlet } from "react-router-dom";
import { AutoSuggest } from "../components/AutoSuggest";
import { CurrentFilters } from "../components/CurrentFilters";
import { Facets } from "../components/Facets";
import { Paging } from "../components/Paging";
import { ResultHeader } from "../components/ResultHeader";
import {
  AllFacets,
  TableSearchResultList,
} from "../components/SearchResultList";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";

const AdminNavBar = () => {
  return (
    <nav className="bg-white dark:bg-gray-700 shadow-md border-t border-gray-300 dark:border-gray-700">
      <div className="mx-auto sm:px-6 lg:px-4">
        <div className="flex items-center justify-between h-12">
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-4">
              <Link
                to="/edit/facets"
                className="text-gray-600 dark:text-gray-100 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                Facets
              </Link>
              <Link
                to="/edit/bulk"
                className="text-gray-600 dark:text-gray-100 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                Overview
              </Link>

              <Link
                to="/updated"
                className="text-gray-600 dark:text-gray-100 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                Updates items
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export const SaveButton = () => {
  const [loading, setLoading] = useState(false);
  const save = () => {
    setLoading(true);
    fetch("/admin/save", { method: "POST" }).finally(() => setLoading(false));
  };
  return (
    <div className="fixed bottom-0 right-0 p-4">
      <button
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={save}
      >
        {loading ? (
          <LoaderCircle className="size-4 animate-spin inline-block" />
        ) : (
          <span> Save changes </span>
        )}
      </button>
    </div>
  );
};

export const Admin = () => {
  return (
    <>
      <AdminNavBar />
      <div className="px-10 py-2 bg-gray-100 dark:bg-gray-900 min-h-screen">
        <Outlet />
        <SaveButton />
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
