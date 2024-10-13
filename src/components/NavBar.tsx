import { Bell, LoaderCircle, Menu, Settings, User } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import useSWR from "swr";
import { cm } from "../utils";

const UserButton = () => {
  const { data, isLoading } = useSWR(
    "/admin/user",
    (url) =>
      fetch(url).then(async (res) => {
        if (res.status === 401) {
          return null;
        }
        return res.json();
      }),
    {
      revalidateOnFocus: true,
      errorRetryInterval: 50000,
    }
  );
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

export function Navbar() {
  return (
    <nav className="bg-white shadow-md">
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
                <Link
                  to="/"
                  className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Search
                </Link>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>

                <Link
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
                </Link>
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
