import { Outlet } from "react-router-dom";
import { ButtonLink } from "../components/ui/button";
import { Sessions } from "../components/Sessions";

export const Tracking = () => {
  return (
    <div className="grid grid-cols-[25rem,auto] min-h-screen">
      <div className="border-r border-gray-300 py-10 px-5 flex flex-col gap-4 bg-gray-50 sticky top-0">
        <div className="flex flex-col gap-4 pb-6">
          <ButtonLink to="/stats/queries">Queries</ButtonLink>

          <ButtonLink to="/stats/popular">Popular items</ButtonLink>

          <ButtonLink to="/stats/facets">Popular facets</ButtonLink>
          <ButtonLink to="/stats/funnels">Funnels</ButtonLink>
        </div>
        <h3 className="font-bold">Sessions</h3>
        <div className="flex-1 overflow-y-auto">
          <Sessions />
        </div>
      </div>
      <div className="p-10">
        <Outlet />
      </div>
    </div>
  );
};
