import { Bell, LoaderCircle, Menu, Settings, User } from "lucide-react";
import { Button } from "./ui/button";
import { Link, To } from "react-router-dom";
import { cm } from "../utils";
import { useIsAdmin, useUser } from "../adminHooks";
import { PropsWithChildren } from "react";

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

const MenuLink = ({ to, children }: PropsWithChildren<{ to: To }>) => (
  <Link
    to={to}
    className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
  >
    {children}
  </Link>
);

export function Navbar() {
  const isAdmin = useIsAdmin();
  return (
    <nav className="bg-white shadow-md hidden md:block">
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
                <MenuLink to="/">Search</MenuLink>
                <MenuLink to="/dashboard">Dashboard</MenuLink>
                <MenuLink to="/builder">PC Builder</MenuLink>
                <MenuLink to="/stats">Tracking</MenuLink>
                <MenuLink to="/rules">Rules</MenuLink>
                {isAdmin && <MenuLink to="/edit">Edit</MenuLink>}
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
