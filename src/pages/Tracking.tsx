import { Link, Outlet } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Sessions } from "../components/Sessions";

export const Tracking = () => {
  return (
    <div className="grid grid-cols-[25rem,auto] min-h-screen">
      <div className="border-r border-gray-300 py-10 px-5">
        <div className="flex flex-col gap-4 pb-6">
          <Button variant="outline">
            <Link to="/stats/queries" className="font-bold block">
              Queries
            </Link>
          </Button>

          <Button variant="outline">
            <Link to="/stats/popular" className="font-bold block">
              Popular items
            </Link>
          </Button>

          <Button variant="outline">
            <Link to="/stats/facets" className="font-bold block">
              Popular facets
            </Link>
          </Button>
        </div>
        <h3 className="font-bold">Sessions</h3>
        <Sessions />
      </div>
      <div className="p-10">
        <Outlet />
      </div>
    </div>
  );
};
