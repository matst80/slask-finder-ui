import { Bell, LoaderCircle, Menu, Settings, User } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { cm } from "../utils";
import { useIsAdmin, useUser } from "../adminHooks";

const UserButton = () => {
  const { data, isLoading } = useUser();
  const loggedIn = data?.role != null;
  return (
    <a href={loggedIn ? "/admin/logout" : "/admin/login"}>
      <Button
        variant={loggedIn ? "outline" : "ghost"}
        size="icon"
        title={data?.name ?? "Logga in"}
      >
        {isLoading ? (
          <LoaderCircle className="size-5 animate-spin inline-block ml-2" />
        ) : (
          <User className={cm("size-5", loggedIn ? "text-blue-600" : "")} />
        )}
      </Button>
    </a>
  );
};

const links = {
  "/": "Search",
  "/dashboard": "Dashboard",
  "/stats": "Tracking",
};

export function Navbar() {
  const isAdmin = useIsAdmin();
  return (
    <nav className="bg-white shadow-md dark:bg-gray-800 dark:text-white">
      <div className="mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600">
                slask-finder
              </span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {Object.entries(links).map(([to, text]) => (
                  <Link
                    key={to}
                    to={to}
                    className="text-gray-600 dark:text-white hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {text}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/edit"
                    className="text-gray-600 dark:text-white hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <UserButton />
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
