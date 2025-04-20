import { Link } from "react-router-dom";

export const AdminNavBar = () => {
  return (
    <nav className="bg-white shadow-md border-t border-gray-300">
      <div className="mx-auto sm:px-6 lg:px-4">
        <div className="flex items-center justify-between h-12">
          <div className="overflow-x-auto">
            <div className="flex items-center gap-2 md:gap-4 flex-nowrap">
              <Link
                to="/edit/facets"
                className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium flex-shrink-0"
              >
                Facets
              </Link>
              <Link
                to="/edit/fields"
                className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium flex-shrink-0"
              >
                Fields
              </Link>
              <Link
                to="/edit/missing-fields"
                className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium flex-shrink-0"
              >
                Missing facets
              </Link>
              <Link
                to="/edit/bulk"
                className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium flex-shrink-0"
              >
                Overview
              </Link>

              <Link
                to="/edit/rules"
                className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium flex-shrink-0"
              >
                Rules
              </Link>
              <Link
                to="/edit/relations"
                className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium flex-shrink-0"
              >
                Relationer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
