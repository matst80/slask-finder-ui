import { Link } from "react-router-dom";

export const AdminNavBar = () => {
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
                to="/edit/fields"
                className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                Fields
              </Link>
              <Link
                to="/edit/bulk"
                className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                Overview
              </Link>

              <Link
                to="/updated"
                className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
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
