import { Outlet } from "react-router-dom";
import { useKeyboardAdminToggle } from "../hooks/appState";

export const Admin = () => {
  useKeyboardAdminToggle();
  return (
    <>
      {/* <AdminNavBar /> */}
      <div className="p-2 md:p-10 bg-gray-100 min-h-screen">
        <Outlet />
        {/* <SaveButton /> */}
      </div>
    </>
  );
};
