import { Bell, Menu, Search, Settings, User } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-4">
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
                  to="/dashboard"
                  className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/"
                  className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Products
                </Link>
                <Link
                  to="/tracking"
                  className="text-gray-600 hover:bg-gray-200 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Tracking
                </Link>
                <Link
                  to="/admin"
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
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
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
